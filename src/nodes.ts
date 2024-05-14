import { Modifier } from 'typescript';
import { Fill, Stroke, Transform, resolve } from './attributes';
import { RenderPlanGroup, RenderPlan, RenderPlanPath } from './render-plan';
import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Attr, resolveAttr } from './attributes';
import { Path, SubPath } from './path';

/** A thing that can contribute to rendering on a canvas. */
export abstract class BaseNode {
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
    ctx = ctx.clone();
    let rp = this.planImpl(ctx);
    if (rp) {
      let m = this.transform?.getMatrix(ctx);
      if (m) {
        rp.applyTransform(m)
      }

      if (this.fill || this.stroke) {
        rp.applyStyle(resolve(this.fill, ctx), resolve(this.stroke, ctx));
      }
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
  [n: string]: any;

  clone(): PlanContext {
    let c = new PlanContext();

    for (let k in this) {
      c[k] = this[k];

      // Deep clone if a "clone" method exists on property?
    }
    return c;
  }
}

export class GroupNode extends BaseNode {
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

export class CornerRectNode extends BaseNode {
  constructor(tl: Attr<Vector>, size: Attr<Vector>) {
    super();
    this.tl = tl;
    this.size = size;
  }

  tl: Attr<Vector>;
  size: Attr<Vector>;

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let tl = resolveAttr(this.tl, ctx);
    let size = resolveAttr(this.size, ctx);

    let sp = rp.path.newSubPath(tl);
    sp.lineTo(new Vector(tl.x + size.x, tl.y));
    sp.lineTo(new Vector(tl.x + size.x, tl.y + size.y));
    sp.lineTo(new Vector(tl.x, tl.y + tl.y));
    sp.closed = true;

    rp.fill = resolve(ctx.fill, ctx);
    rp.stroke = resolve(ctx.stroke, ctx);
    return rp;
  }
}

export class CenterRectNode extends BaseNode {
  constructor(center: Attr<Vector>, size: Attr<Vector>) {
    super();
    this.center = center;
    this.size = size;
  }

  center: Attr<Vector>;
  size: Attr<Vector>;

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let center = resolveAttr(this.center, ctx);
    let halfSize = resolveAttr(this.size, ctx).divScalar(2);

    let sp = rp.path.newSubPath(new Vector(center.x - halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y + halfSize.y));
    sp.lineTo(new Vector(center.x - halfSize.x, center.y + halfSize.y));
    sp.closed = true;
    return rp;
  }
}

export class PolygonNode extends BaseNode {
  constructor(sides: Attr<number>, radius: Attr<number>) {
    super();
    this.sides = sides;
    this.radius = radius;
  }

  sides: Attr<number>;
  radius: Attr<number>

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let sides = resolveAttr(this.sides, ctx);
    let radius = resolveAttr(this.radius, ctx);

    let radPerSide = Math.PI * 2 / sides;

    let sp: SubPath;
    for (let i = 0; i < sides; i++) {
      let x = Math.sin(radPerSide * i) * radius;
      let y = Math.cos(radPerSide * i) * radius;
      if (i == 0) {
        sp = rp.path.newSubPath(new Vector(x, y));
      } else {
        sp!.lineTo(new Vector(x, y));
      }
    }
    sp!.closed = true;
    return rp;
  }
}

/** Adds an approximation of a quarter of a circle to the path.
 * 
 * See https://pomax.github.io/bezierinfo/#circles_cubic
 */
function makeCircularArc(sp: SubPath, p1: Vector, p2: Vector, hori: boolean): void {
  const c = 0.551915024494;
  const cp1 = p1.clone();
  const cp2 = p2.clone();

  if (hori) {
    cp1.add(new Vector((p2.x - p1.x) * c, 0));
    cp2.add(new Vector(0, (p1.y - p2.y) * c));
  } else {
    cp1.add(new Vector(0, (p2.y - p1.y) * c));
    cp2.add(new Vector((p1.x - p2.x) * c, 0));
  }
  sp.bezierTo(cp1, cp2, p2);
}

export class circleNode extends BaseNode {
  constructor(radius: Attr<number>) {
    super();
    this.radius = radius;
  }

  sides: Attr<number>;
  radius: Attr<number>

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let r = resolveAttr(this.radius, ctx);

    const pts = [
      new Vector(r, 0),
      new Vector(0, r),
      new Vector(-r, 0),
      new Vector(0, -r),
    ];
    let sp: SubPath = rp.path.newSubPath(pts[0], true);
    makeCircularArc(sp, pts[0], pts[1], false);
    makeCircularArc(sp, pts[1], pts[2], true);
    makeCircularArc(sp, pts[2], pts[3], false);
    makeCircularArc(sp, pts[3], pts[0], true);

    return rp;
  }
}