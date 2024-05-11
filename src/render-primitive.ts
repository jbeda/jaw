import { AffineMatrix } from './affine-matrix';
import { Concrete, Fill, Stroke } from './attributes';
import { Path } from './path';
import { Vector } from './vector';

export class RenderContext {
}

export abstract class RenderPlan {
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

export class RenderPlanGroup extends RenderPlan {
  children: Array<RenderPlan> = new Array<RenderPlan>();

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

export class RenderPlanPath extends RenderPlan {
  stroke?: Concrete<Stroke>;
  fill?: Concrete<Fill>;

  path: Path = new Path();

  htmlCanvasRenderImpl(ctx: CanvasRenderingContext2D, rc: RenderContext): void {
    let path2d = new Path2D();
    for (let sp of this.path.subpaths) {
      sp.addToCanvasPath(ctx, path2d);
    }
    if (this.fill) {
      let fillStyle = this.fill.color.toCSSString();
      ctx.fillStyle = fillStyle;
      ctx.fill(path2d);
    }
    if (this.stroke) {
      ctx.strokeStyle = this.stroke.getColor.toCSSString();
      ctx.stroke(path2d);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    this.path.applyTransform(transform);
  }
}
