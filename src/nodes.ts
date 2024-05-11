import { Modifier } from 'typescript';
import { Fill, Stroke, Transform, resolve } from './attributes';
import { Canvas } from './canvas';
import { RenderPlanGroup, RenderPlan, RenderPlanPath } from './render-primitive';
import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';

/** A thing that can contribute to rendering on a canvas. */
export abstract class BaseNode {
  constructor(c: Canvas) {
    this.canvas = c;
  }

  readonly canvas: Canvas;

  parent?: BaseNode;

  get children(): Array<BaseNode> | undefined {
    return undefined;
  }

  fill?: Fill;
  setFill(fill: Fill): BaseNode {
    this.fill = fill;
    return this;
  }
  stroke?: Stroke;
  setStroke(stroke: Stroke): BaseNode {
    this.stroke = stroke;
    return this;
  }
  transform?: Transform;
  setTransform(transform: Transform): BaseNode {
    this.transform = transform;
    return this;
  }
  readonly modifiers: Array<Modifier> = new Array<Modifier>();

  plan(ctx: PlanContext): RenderPlan | undefined {
    let c = ctx.clone();
    let m = this.transform?.getMatrix(ctx);
    if (m) {
      c.matrix = c.matrix.mul(m);
    }

    if (this.fill) {
      c.fill = this.fill;
    }
    if (this.stroke) {
      c.stroke = this.stroke;
    }

    let rp = this.planImpl(c);

    if (rp && m) {
      rp.transform = m.clone();
    }
    return rp;
  }

  /** Subclasses implement this to return their rendering plan.
   * 
   * Override this method to implement planning for your node.  The context will
   * automatically have your transform applied to it.  In addition, it will be
   * applied to all of your primitives automatically as you return.
   */
  protected abstract planImpl(ctx: PlanContext): RenderPlan | undefined;

}

export class PlanContext {
  matrix: AffineMatrix = new AffineMatrix();
  fill?: Readonly<Fill>;
  stroke?: Readonly<Stroke>;

  vars: { [n: string]: any } = {};

  clone(): PlanContext {
    let c = new PlanContext();
    c.matrix = this.matrix.clone();

    // We don't deep clone fill and stroke because, when traversing, we will
    // replace them vs. modifying them.
    c.fill = this.fill;
    c.stroke = this.stroke;
    c.vars = this.vars;

    return c;
  }
}

export class GroupNode extends BaseNode {
  constructor(c: Canvas) {
    super(c);
  }

  #children: Array<BaseNode> = new Array<BaseNode>();
  get children(): Array<BaseNode> {
    return this.#children;
  }

  appendChild<T extends BaseNode>(n: T): T {
    n.parent = this;
    this.#children.push(n);
    return n;
  }

  prependChild<T extends BaseNode>(n: T): T {
    n.parent = this;
    this.#children.unshift(n);
    return n;
  }

  planImpl(ctx: PlanContext): RenderPlan | undefined {
    if (this.children.length == 0) {
      return undefined;
    }

    let rp = new RenderPlanGroup();
    for (let c of this.children) {
      let crp = c.plan(ctx);
      if (crp) {
        rp.children.push(crp);
      }
    }
    return rp;
  }
}

export class RectNode extends BaseNode {
  constructor(c: Canvas, x: number, y: number, width: number, height: number) {
    super(c);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  x: number;
  y: number;
  width: number;
  height: number;

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();
    let sp = rp.newSubPath(new Vector(this.x, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y + this.height));
    sp.lineTo(new Vector(this.x, this.y + this.height));
    sp.closed = true;

    rp.fill = resolve(ctx.fill, ctx);
    rp.stroke = resolve(ctx.stroke, ctx);
    return rp;
  }
}