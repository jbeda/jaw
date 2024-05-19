import { AffineMatrix } from './graphics/affine-matrix';
import { AttrBag, AttrContext, AttrFunc, DynamicAttr } from './attributes';
import { OptionalRenderPlan } from './graphics/render-plan';
import { Vector } from './graphics/vector';

/**
 * A modifier can be attached to a node to modify the render plan.
 */
export class Modifier extends AttrBag {
  enabled: boolean = true;
  enable(): Modifier {
    this.enabled = true;
    return this;
  }
  disable(): Modifier {
    this.enabled = false;
    return this;
  }

  /** The derived class can return multiple contexts.
   * 
   * @param innerCtx The context with the evaluated parameters on this modifier.
   * @param childCtx The context that will be passed to the children.
   * @returns An array of contexts to be passed to the children derived from childCtx.
   */
  createContexts(innerCtx: AttrContext, childCtx: AttrContext): AttrContext[] {
    // Create multiple contexts.  May have extra values on added.
    // For each
    return [childCtx];
  }

  /**
   * This is where the modifier modifies the render plan.
   * 
   * @param rps Incoming render plans to be modified.
   * @param innerCtx Context with the evaluated parameters on this modifier.
   * @returns An array of render plans that have been modified.
   */
  plan(rps: OptionalRenderPlan[], innerCtx: AttrContext,): OptionalRenderPlan[] {
    return rps;
  }
}

export class LinearRepeat extends Modifier {
  constructor(
    count: number | AttrFunc<number>,
    offset?: Vector | AttrFunc<Vector>,
    repAttrName?: string | AttrFunc<string>) {
    super();

    this.attrs.push(new DynamicAttr("count", count));
    this.attrs.push(new DynamicAttr("offset", offset ?? new Vector(50, 0)));
    this.attrs.push(new DynamicAttr("repAttrName", repAttrName ?? 'rep'));
  }

  createContexts(innerCtx: AttrContext, childCtx: AttrContext): AttrContext[] {
    let ret: AttrContext[] = [];
    let repAttrName = innerCtx.get("repAttrName") as string;
    let count = Math.trunc(innerCtx.get("count") as number);
    let offset = innerCtx.get("offset") as Vector;

    if (repAttrName !== undefined) {
      for (let i = 0; i < count; i++) {
        ret.push(new AttrContext(childCtx, {
          [repAttrName]: i,
          [repAttrName + "Offset"]: offset.clone().mulScalar(i + 1),
        }));
      }
    }
    return ret;
  }

  plan(rps: OptionalRenderPlan[], innerCtx: AttrContext,): OptionalRenderPlan[] {
    let offset = innerCtx.get("offset") as Vector;
    for (const [i, rp] of rps.entries()) {
      if (rp === undefined) {
        continue;
      }

      let effoffset = offset.clone().mulScalar(i);
      rp.applyTransform(AffineMatrix.fromTranslate(effoffset));
    }
    return rps;
  }
}