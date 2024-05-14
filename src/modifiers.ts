import { Attr } from './attributes';
import { PlanContext } from './nodes';
import { RenderPlan } from './render-plan';

export class Modifier {
  enabled: Attr<boolean> = true;

  plan(rp: RenderPlan | undefined, ctx: PlanContext,): RenderPlan | undefined {
    return rp;
  }
}