import { RenderPlanGroup, RenderPlan, RenderPlanPath, OptionalRenderPlan } from './graphics/render-plan';
import { Vector } from './graphics/vector';
import { SubPath } from './graphics/path';
import { Modifier } from './modifiers';
import { FillModifier, StrokeModifier, TransformModifier } from './stock-modifiers';
import { AttrBag, AttrContext, AttrFunc, DynamicAttr } from './attributes';

/** A thing that can contribute to rendering on a canvas. */
export abstract class BaseNode extends AttrBag {
  readonly fill: FillModifier = new FillModifier();
  readonly stroke: StrokeModifier = new StrokeModifier();
  readonly transform: TransformModifier = new TransformModifier();

  readonly customModifiers: Array<Modifier> = new Array<Modifier>();

  constructor() {
    super();
    this.fill.disable();
    this.stroke.disable();
  };

  getModifiers(): Array<Modifier> {
    return new Array<Modifier>(this.fill, this.stroke, this.transform).concat(this.customModifiers);
  }

  #planWithModifiers(ctx: AttrContext, iModifierIdx: number): RenderPlan | undefined {
    // If we've already applied all modifiers then we plan the node itself.
    if (iModifierIdx == -1) {
      // Resolve the attributes for this node.
      let resolvedCtx = new AttrContext(ctx);
      this.evalAllToContext(resolvedCtx);

      return this.planImpl(resolvedCtx, ctx);
    }

    // Handle modifier at iModifierIdx.
    let mod = this.getModifiers()[iModifierIdx];
    if (mod.enabled == false) {
      return this.#planWithModifiers(ctx, iModifierIdx - 1);
    }

    let innerCtx = new AttrContext(ctx);
    mod.evalAllToContext(innerCtx);

    // Ask the modifier to create any number of contexts.
    let cctxs = mod.createContexts(innerCtx, ctx);
    // If a modifier doesn't give us any contexts then we skip it.
    if (cctxs.length == 0) {
      return this.#planWithModifiers(ctx, iModifierIdx - 1);
    }

    // For each context, call the next modifier or the node itself to get render plans.
    let rps: OptionalRenderPlan[] = [];
    for (let cctx of cctxs) {
      rps.push(this.#planWithModifiers(cctx, iModifierIdx - 1));
    }

    // No apply this modifier to the render plans.
    rps = mod.plan(rps, innerCtx);

    // Package the result into a single render plan.
    if (rps.length == 0) {
      return undefined;
    } else if (rps.length == 1) {
      return rps[0];
    } else if (rps.length > 1) {
      let rpg = new RenderPlanGroup();
      rpg.children = rps.filter((r) => r !== undefined) as RenderPlan[];
      return rpg;
    }
  }

  /**
   * Create a RenderPlan for this node.
   *
   * @param ctx The context for this node to work with. This nodes attributes
   * are not evaluated yet.
   * @returns The render plan for this node or undefined if there is nothing to
   * render.
   */
  plan(ctx: AttrContext): RenderPlan | undefined {
    return this.#planWithModifiers(ctx, this.getModifiers().length - 1);
  }

  /** 
   * Subclasses implement this to return their rendering plan.
   * 
   * Override this method to implement planning for your node.
   * 
   * @param innerCtx The context with the evaluated parameters on this node.
   * @param childCtx The context that will be passed to the children.
   * @returns The render plan for this node or undefined if there is nothing to render.
   */
  protected abstract planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan | undefined;

}

export class GroupNode extends BaseNode {
  #children: Array<BaseNode> = new Array<BaseNode>();
  get children(): Array<BaseNode> {
    return this.#children;
  }

  appendChild<T extends BaseNode>(n: T): T {
    this.#children.push(n);
    return n;
  }

  prependChild<T extends BaseNode>(n: T): T {
    this.#children.unshift(n);
    return n;
  }

  planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan | undefined {
    // Call plan on all children and collect the results.
    let rps: RenderPlan[] = [];
    for (let c of this.children) {
      let crp = c.plan(childCtx);
      if (crp) {
        rps.push(crp);
      }
    }

    // Convert the results into a singluar render plan.
    if (rps.length == 0) {
      return undefined
    } else if (rps.length == 1) {
      return rps[0];
    } else {
      let rpg = new RenderPlanGroup();
      rpg.children = rps.slice();
      return rpg;
    }
  }
}

export class CornerRectNode extends BaseNode {
  constructor(topleft: Vector | AttrFunc<Vector>, size: Vector | AttrFunc<Vector>) {
    super();
    this.attrs.push(new DynamicAttr("topleft", topleft));
    this.attrs.push(new DynamicAttr("size", size));
  }

  planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan {
    let rp = new RenderPlanPath();

    let tl = innerCtx.get("topleft") as Vector;
    let size = innerCtx.get("size") as Vector;

    let sp = rp.path.newSubPath(tl);
    sp.lineTo(new Vector(tl.x + size.x, tl.y));
    sp.lineTo(new Vector(tl.x + size.x, tl.y + size.y));
    sp.lineTo(new Vector(tl.x, tl.y + tl.y));
    sp.closed = true;

    return rp;
  }
}

export class CenterRectNode extends BaseNode {
  constructor(center: Vector | AttrFunc<Vector>, size: Vector | AttrFunc<Vector>) {
    super();
    this.attrs.push(new DynamicAttr("center", center));
    this.attrs.push(new DynamicAttr("size", size));
  }

  planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan {
    let rp = new RenderPlanPath();

    let center = innerCtx.get("center") as Vector;
    let halfSize = (innerCtx.get("size") as Vector).divScalar(2);

    let sp = rp.path.newSubPath(new Vector(center.x - halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y - halfSize.y));
    sp.lineTo(new Vector(center.x + halfSize.x, center.y + halfSize.y));
    sp.lineTo(new Vector(center.x - halfSize.x, center.y + halfSize.y));
    sp.closed = true;
    return rp;
  }
}

export class PolygonNode extends BaseNode {
  constructor(sides: number | AttrFunc<number>, radius: number | AttrFunc<number>) {
    super();
    this.attrs.push(new DynamicAttr("sides", sides));
    this.attrs.push(new DynamicAttr("radius", radius));
  }
  planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan {
    let rp = new RenderPlanPath();

    let sides = innerCtx.get("sides") as number;
    let radius = innerCtx.get("radius") as number;

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
  constructor(radius: number | AttrFunc<number>) {
    super();
    this.attrs.push(new DynamicAttr("radius", radius));
  }

  planImpl(innerCtx: AttrContext, childCtx: AttrContext): RenderPlan {
    let rp = new RenderPlanPath();

    let r = innerCtx.get("radius") as number;

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