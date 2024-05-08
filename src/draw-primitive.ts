import { AffineMatrix } from './affine-matrix';
import { Fill, Stroke } from './attributes';
import { Vector } from './vector';

export abstract class DrawPrimitive {
  // Render this primitive to an HTML canvas.
  abstract htmlCanvasRender(ctx: CanvasRenderingContext2D): void

  // Apply a transformation to this primitive.  Modifies it in place.
  abstract applyTransform(transform: AffineMatrix): void
}

export class DrawGroup extends DrawPrimitive {
  children: Array<DrawPrimitive> = new Array<DrawPrimitive>();

  htmlCanvasRender(ctx: CanvasRenderingContext2D): void {
    for (let c of this.children) {
      c.htmlCanvasRender(ctx);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    for (let c of this.children) {
      c.applyTransform(transform);
    }
  }
}

export class Path extends DrawPrimitive {
  stroke?: Stroke;
  fill?: Fill;

  readonly subpaths: Array<SubPath> = new Array<SubPath>();

  newSubPath(start: Vector, closed: boolean = true): SubPath {
    let subpath = new SubPath(start, closed);
    this.subpaths.push(subpath);
    return subpath;
  }

  htmlCanvasRender(ctx: CanvasRenderingContext2D): void {
    let path2d = new Path2D();
    for (let sp of this.subpaths) {
      sp.addToCanvasPath(ctx, path2d);
    }
    if (this.fill && this.fill.enabled) {
      ctx.fillStyle = this.fill.color.toCSSString();
      ctx.fill(path2d);
    }
    if (this.stroke && this.stroke.enabled) {
      ctx.strokeStyle = this.stroke.color.toCSSString();
      ctx.stroke(path2d);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    throw new Error("Method not implemented.");
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