import { AffineMatrix } from './affine-matrix';
import { Concrete, Fill, Stroke, cloneConcreteAttrBag } from './attributes';
import { Path } from './path';
import { Vector } from './vector';

export class RenderContext {
}

export abstract class RenderPlan {
  // Render this primitive to an HTML canvas.
  htmlCanvasRender(ctx2d: CanvasRenderingContext2D, rc: RenderContext): void {
    this.htmlCanvasRenderImpl(ctx2d, rc);
  }

  protected abstract htmlCanvasRenderImpl(ctx2d: CanvasRenderingContext2D, rc: RenderContext): void

  /** Apply a transformation to this primitive.  Modifies it in place.
   */
  abstract applyTransform(transform: AffineMatrix): void

  abstract applyStyle(fill?: Concrete<Fill>, stroke?: Concrete<Stroke>): void
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

  applyStyle(
    fill?: Concrete<Fill> | undefined,
    stroke?: Concrete<Stroke> | undefined
  ): void {
    for (let c of this.children) {
      c.applyStyle(fill, stroke);
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

  applyStyle(fill?: Concrete<Fill>, stroke?: Concrete<Stroke>): void {
    this.fill = cloneConcreteAttrBag(fill);
    this.stroke = cloneConcreteAttrBag(stroke);
  }
}
