import { AffineMatrix } from './affine-matrix';
import { DynamicAttr, cloneDynamicAttr, cloneOptionalDynamicAttr, resolveDynamicAttr, resolveOptionalDynamicAttr } from './attributes';
import { PlanContext } from './nodes';
import { OptionalRenderPlan } from './render-plan';
import { Vector } from './vector';

export class Modifier {
  createContexts(ctx: PlanContext): PlanContext[] {
    return [ctx];
  }

  plan(rps: OptionalRenderPlan[], ctx: PlanContext,): OptionalRenderPlan[] {
    return rps;
  }
}

export class LinearRepeat extends Modifier {
  count: DynamicAttr<number> = 3;
  offset: DynamicAttr<Vector> = new Vector(50, 0);
  repAttrName: DynamicAttr<string> = 'repeatIndex';

  constructor(count: DynamicAttr<number>, offset?: DynamicAttr<Vector>, repAttrName?: DynamicAttr<string>) {
    super();
    this.count = cloneDynamicAttr(count);
    this.offset = cloneOptionalDynamicAttr(offset) ?? new Vector(50, 0);
    this.repAttrName = cloneOptionalDynamicAttr(repAttrName) ?? 'repeatIndex';
  }

  createContexts(ctx: PlanContext): PlanContext[] {
    let ret: PlanContext[] = [];
    let repAttrName = resolveOptionalDynamicAttr(this.repAttrName, ctx);
    let count = Math.trunc(resolveDynamicAttr(this.count, ctx));
    let offset = resolveDynamicAttr(this.offset, ctx);

    if (repAttrName !== undefined) {
      for (let i = 0; i < count; i++) {
        ret.push(ctx.clone({
          [repAttrName]: i,
          offset: offset.clone().mulScalar(i + 1),
        }));
      }
    }
    return ret;
  }

  plan(rps: OptionalRenderPlan[], ctx: PlanContext,): OptionalRenderPlan[] {
    let offset = resolveDynamicAttr(this.offset, ctx);
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