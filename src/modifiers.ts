import { AffineMatrix } from './affine-matrix';
import { DynamicAttr, resolveDynamicAttr } from './attributes';
import { PlanContext } from './nodes';
import { RenderPlan } from './render-plan';
import { Vector } from './vector';

export class Modifier {
  enabled: DynamicAttr<boolean> = true;

  createContexts(ctx: PlanContext): PlanContext[] {
    return [ctx];
  }

  plan(rps: RenderPlan[] | undefined, ctx: PlanContext,): RenderPlan[] | undefined {
    return rps;
  }
}

export class LinearRepeat extends Modifier {
  count: DynamicAttr<number> = 3;
  repAttrName?: DynamicAttr<string> = 'repeatIndex';
  offset: DynamicAttr<Vector> = new Vector(50, 0)

  createContexts(ctx: PlanContext): PlanContext[] {
    let ret: PlanContext[] = [];
    let repAttrName = this.repAttrName ? resolveDynamicAttr(this.repAttrName, ctx) : undefined;
    let count = Math.trunc(resolveDynamicAttr(this.count, ctx));
    let offset = resolveDynamicAttr(this.offset, ctx);

    if (repAttrName !== undefined) {
      for (let i = 0; i < count; i++) {
        ret.push(ctx.clone({
          [repAttrName]: i,
          offset: offset.mulScalar(i),
        }));
      }
    }
    return ret;
  }

  plan(rps: RenderPlan[], ctx: PlanContext,): RenderPlan[] {

    let offset = resolveDynamicAttr(this.offset, ctx)!;
    for (const [i, rp] of rps.entries()) {
      let effoffset = offset.clone().mulScalar(i);
      rp.applyTransform(AffineMatrix.fromTranslate(effoffset));
    }
    return rps;
  }
}