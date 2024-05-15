import { DynamicAttr, DynamicAttrBag, DynamicFill, DynamicGenericAttrBag, DynamicStroke, DynamicTransform, cloneDynamicAttr, cloneOptionalDynamicAttr, cloneOptionalDynamicAttrBag, getTransformMatrix, resolve, resolveDynamicAttr } from './attributes';
import { RenderPlanGroup, RenderPlan, RenderPlanPath } from './render-plan';
import { Vector } from './vector';
import { SubPath } from './path';
import { Modifier } from './modifiers';

/** A thing that can contribute to rendering on a canvas. */
export abstract class BaseNode {
  parent?: BaseNode;

  get children(): Array<BaseNode> | undefined {
    return undefined;
  }

  fill?: DynamicFill;
  setFill(fill: DynamicFill | undefined): BaseNode {
    this.fill = cloneOptionalDynamicAttrBag(fill)
    return this;
  }

  stroke?: DynamicStroke;
  setStroke(stroke: DynamicStroke | undefined): BaseNode {
    this.stroke = cloneOptionalDynamicAttrBag(stroke);
    return this;

  }

  transform?: DynamicTransform;
  setTransform(transform: DynamicTransform | undefined): BaseNode {
    this.transform = cloneOptionalDynamicAttrBag(transform);
    return this;
  }

  readonly modifiers: Array<Modifier> = new Array<Modifier>();

  plan(ctx: PlanContext): RenderPlan | undefined {
    ctx = ctx.clone();
    let rp = this.planImpl(ctx);
    if (rp) {
      let m = getTransformMatrix(this.transform, ctx);
      if (m) {
        rp.applyTransform(m)
      }

      if (this.fill || this.stroke) {
        rp.applyStyle(
          this.fill ? resolve(this.fill, ctx) : undefined,
          this.stroke ? resolve(this.stroke, ctx) : undefined);
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

// TODO: need to noodle on this more.  Should this be an AttrBag? When/how do
// dynamic attributes get resolved? Is there a dependency order to them?
// Circular references?
// TODO: What do we need to clone when here?
export class PlanContext {
  attrs: { [key: string]: any } = {};

  clone(extra?: DynamicGenericAttrBag): PlanContext {
    let c = new PlanContext();

    for (let k in this.attrs) {
      c.attrs[k] = this.attrs[k];
    }

    if (extra !== undefined) {
      for (let k in extra) {
        c.attrs[k] = extra[k];
      }
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
  constructor(tl: DynamicAttr<Vector>, size: DynamicAttr<Vector>) {
    super();
    this.tl = cloneDynamicAttr(tl);
    this.size = cloneDynamicAttr(size);
  }

  tl: DynamicAttr<Vector>;
  size: DynamicAttr<Vector>;

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let tl = resolveDynamicAttr(this.tl, ctx);
    let size = resolveDynamicAttr(this.size, ctx);

    let sp = rp.path.newSubPath(tl);
    sp.lineTo(new Vector(tl.x + size.x, tl.y));
    sp.lineTo(new Vector(tl.x + size.x, tl.y + size.y));
    sp.lineTo(new Vector(tl.x, tl.y + tl.y));
    sp.closed = true;

    return rp;
  }
}

export class CenterRectNode extends BaseNode {
  constructor(center: DynamicAttr<Vector>, size: DynamicAttr<Vector>) {
    super();
    this.center = cloneDynamicAttr(center);
    this.size = cloneDynamicAttr(size);
  }

  center: DynamicAttr<Vector>;
  size: DynamicAttr<Vector>;

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let center = resolveDynamicAttr(this.center, ctx);
    let halfSize = resolveDynamicAttr(this.size, ctx).divScalar(2);

    let sp = rp.path.newSubPath(new Vector(center.x - halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y + halfSize.y));
    sp.lineTo(new Vector(center.x - halfSize.x, center.y + halfSize.y));
    sp.closed = true;
    return rp;
  }
}

export class PolygonNode extends BaseNode {
  constructor(sides: DynamicAttr<number>, radius: DynamicAttr<number>) {
    super();
    this.sides = cloneDynamicAttr(sides);
    this.radius = cloneDynamicAttr(radius);
  }

  sides: DynamicAttr<number>;
  radius: DynamicAttr<number>

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let sides = resolveDynamicAttr(this.sides, ctx);
    let radius = resolveDynamicAttr(this.radius, ctx);

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
  constructor(radius: DynamicAttr<number>) {
    super();
    this.radius = cloneDynamicAttr(radius);
  }

  radius: DynamicAttr<number>

  planImpl(ctx: PlanContext): RenderPlan {
    let rp = new RenderPlanPath();

    let r = resolveDynamicAttr(this.radius, ctx);

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