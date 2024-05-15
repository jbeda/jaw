import { AffineMatrix } from './affine-matrix';
import { Fill, Stroke, cloneConcreteAttrBag } from './attributes';
import { Path } from './path';

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

  /** Apply a style to this primitive, recursively.  Modifies it in place.
   * 
   * If fill or stroke is undefined then the nothing will be set.
   */
  abstract applyStyle(fill: Fill | undefined, stroke: Stroke | undefined): void
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
    fill: Fill | undefined,
    stroke: Stroke | undefined
  ): void {
    for (let c of this.children) {
      c.applyStyle(fill, stroke);
    }
  }
}

export class RenderPlanPath extends RenderPlan {
  stroke?: Stroke;
  fill?: Fill;

  path: Path = new Path();

  htmlCanvasRenderImpl(ctx: CanvasRenderingContext2D, rc: RenderContext): void {

    let path2D = this.path.getPath2D();

    if (this.fill !== undefined && this.fill.color !== undefined) {
      ctx.fillStyle = this.fill.color.toCSSString();
      ctx.fill(path2D);
    }
    if (this.stroke !== undefined && this.stroke.color !== undefined) {
      ctx.strokeStyle = this.stroke.color.toCSSString();
      ctx.stroke(path2D);
    }
  }

  applyTransform(transform: AffineMatrix): void {
    this.path.applyTransform(transform);
  }

  applyStyle(fill: Fill | undefined, stroke: Stroke | undefined): void {
    if (fill !== undefined) {
      this.fill = cloneConcreteAttrBag(fill);
    }
    if (stroke !== undefined) {
      this.stroke = cloneConcreteAttrBag(stroke);
    }
  }
}
