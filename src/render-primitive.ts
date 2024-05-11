import { AffineMatrix } from './affine-matrix';
import { Fill, Stroke } from './attributes';
import { Vector } from './vector';

export class RenderContext {
}

export abstract class RenderPrimitive {
  transform?: AffineMatrix;

  // Render this primitive to an HTML canvas.
  htmlCanvasRender(ctx2d: CanvasRenderingContext2D, rc: RenderContext): void {
    let m = this.transform;
    // Do full save/restore here?
    let prevCanvasMatrix: DOMMatrix | null = null;
    if (m) {
      prevCanvasMatrix = ctx2d.getTransform();
      ctx2d.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
    }
    this.htmlCanvasRenderImpl(ctx2d, rc);
    if (m) {
      ctx2d.setTransform(prevCanvasMatrix as DOMMatrix);
    }
  }

  protected abstract htmlCanvasRenderImpl(ctx2d: CanvasRenderingContext2D, rc: RenderContext): void

  /** Apply a transformation to this primitive.  Modifies it in place.
   * 
   * This isn't used in the rendering path but rather as a utility method for Modifiers.
   */
  abstract applyTransform(transform: AffineMatrix): void
}

export class RenderGroup extends RenderPrimitive {
  children: Array<RenderPrimitive> = new Array<RenderPrimitive>();

  htmlCanvasRenderImpl(ctx2d: CanvasRenderingContext2D, rc: RenderContext): void {
    for (let c of this.children) {
      c.htmlCanvasRender(ctx2d, rc);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    for (let c of this.children) {
      c.applyTransform(transform);
    }
  }
}

export class RenderPath extends RenderPrimitive {
  stroke?: Stroke;
  fill?: Fill;

  readonly subpaths: Array<SubPath> = new Array<SubPath>();

  newSubPath(start: Vector, closed: boolean = true): SubPath {
    let subpath = new SubPath(start, closed);
    this.subpaths.push(subpath);
    return subpath;
  }

  htmlCanvasRenderImpl(ctx: CanvasRenderingContext2D, rc: RenderContext): void {
    let path2d = new Path2D();
    for (let sp of this.subpaths) {
      sp.addToCanvasPath(ctx, path2d);
    }
    if (this.fill) {
      let fillStyle = this.fill.color.toCSSString();
      ctx.fillStyle = fillStyle;
      ctx.fill(path2d);
    }
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.color.toCSSString();
      ctx.stroke(path2d);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    for (let sp of this.subpaths) {
      sp.applyTransform(transform);
    }
  }

}

enum SegmentType {
  LINE,         // 1 point for a line
  CUBIC_BEZIER  // 3 points total: 2 control points and an end point for a cubic bezier
}

export class SubPath {
  constructor(start: Vector, closed: boolean = true) {
    this.#start = start;
    this.closed = closed;
  }

  applyTransform(transform: AffineMatrix) {
    this.#start.transform(transform);
    for (let cp of this.#controlPoints) {
      cp.transform(transform);
    }
  }


  lineTo(end: Vector): void {
    this.#segmentTypes.push(SegmentType.LINE);
    this.#controlPoints.push(end);
  }

  bezierTo(control1: Vector, control2: Vector, end: Vector): void {
    this.#segmentTypes.push(SegmentType.CUBIC_BEZIER);
    this.#controlPoints.push(control1);
    this.#controlPoints.push(control2);
    this.#controlPoints.push(end);
  }

  addToCanvasPath(ctx: CanvasRenderingContext2D, path2d: Path2D): void {
    path2d.moveTo(this.#start.x, this.#start.y);
    let ixp = 0;
    for (let t of this.#segmentTypes) {
      switch (t) {
        case SegmentType.LINE:
          path2d.lineTo(this.#controlPoints[ixp].x, this.#controlPoints[ixp].y);
          ixp++;
          break;
        case SegmentType.CUBIC_BEZIER:
          path2d.bezierCurveTo(
            this.#controlPoints[ixp].x, this.#controlPoints[ixp].y,
            this.#controlPoints[ixp + 1].x, this.#controlPoints[ixp + 1].y,
            this.#controlPoints[ixp + 2].x, this.#controlPoints[ixp + 2].y
          );
          ixp += 2;
          break;
      }
    }
    if (this.closed) {
      path2d.closePath();
    }
  }

  // TODO: Add methods to read/iterate the points.

  #start: Vector;

  // Each path segment has an entry in the segmentTypes array. And the
  // corresponding points in the controlPoints array.  The only way to get
  // segments is to iterate.
  #segmentTypes: Array<SegmentType> = new Array<SegmentType>();
  #controlPoints: Array<Vector> = new Array<Vector>();

  closed: boolean = true;
}