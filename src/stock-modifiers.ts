import { AttrBag, AttrContext, AttrFunc, DynamicAttr } from './attributes';
import { Color } from './graphics/color';
import { Modifier } from './modifiers';
import { OptionalRenderPlan, RenderFill, RenderStroke } from './graphics/render-plan';
import { Vector } from './graphics/vector';
import { AffineMatrix } from './graphics/affine-matrix';

//==============================================================================
// Fill
export class FillModifier extends Modifier {
  constructor(color?: Color | AttrFunc<Color>) {
    super();

    if (color === undefined) {
      color = new Color(0.5, 0.5, 0.5, 1);
    }

    this.attrs.push(new DynamicAttr("color", color));
  }

  getColor(ctx: AttrContext): Color {
    return this.evalAttrByName("color", ctx) as Color;
  }
  setColor(color: Color | AttrFunc<Color> | undefined): FillModifier {
    this.getAttrByName("color")!.value = color;
    return this;
  }

  plan(rps: OptionalRenderPlan[], innerCtx: AttrContext,): OptionalRenderPlan[] {
    console.assert(rps.length == 1, "Fill should only have one render plan.")

    let renderFill = new RenderFill(innerCtx.get("color"));
    rps[0]!.applyStyle(renderFill, undefined);

    return rps;
  }
}

//==============================================================================
// Stroke
// TODO: Add more attributres for stroke

export class StrokeModifier extends Modifier {
  constructor(color?: Color | AttrFunc<Color>) {
    super();

    if (color === undefined) {
      color = new Color(0, 0, 0, 1);
    }

    this.attrs.push(new DynamicAttr("color", color));
  }

  getColor(ctx: AttrContext): Color {
    return this.evalAttrByName("color", ctx) as Color;
  }
  setColor(color: Color | AttrFunc<Color> | undefined): StrokeModifier {
    this.getAttrByName("color")!.value = color;
    return this;
  }

  plan(rps: OptionalRenderPlan[], innerCtx: AttrContext,): OptionalRenderPlan[] {
    console.assert(rps.length == 1, "Stroke should only have one render plan.")

    let renderStroke = new RenderStroke(innerCtx.get("color"));
    rps[0]!.applyStyle(undefined, renderStroke);

    return rps;
  }
}


//==============================================================================

/** Core transformation information. Applied in order: scale, rotation and then translate. */
export class TransformModifier extends Modifier {
  constructor(
    position?: Vector | AttrFunc<Vector>,
    rotation?: number | AttrFunc<number>,
    scale?: Vector | AttrFunc<Vector>,
    center?: Vector | AttrFunc<Vector>) {
    super();

    this.attrs.push(new DynamicAttr("position", position));
    this.attrs.push(new DynamicAttr("rotation", rotation));
    this.attrs.push(new DynamicAttr("scale", scale));
    this.attrs.push(new DynamicAttr("center", center));
  }

  getPosition(ctx: AttrContext): Vector {
    return this.evalAttrByName("position", ctx) as Vector;
  }
  setPosition(position: Vector | AttrFunc<Vector> | undefined): TransformModifier {
    this.getAttrByName("position")!.value = position;
    return this;
  }

  getRotation(ctx: AttrContext): number {
    return this.evalAttrByName("rotation", ctx) as number;
  }
  setRotation(rotation: number | AttrFunc<number> | undefined): TransformModifier {
    this.getAttrByName("rotation")!.value = rotation;
    return this;
  }

  getScale(ctx: AttrContext): Vector {
    return this.evalAttrByName("scale", ctx) as Vector;
  }
  setScale(scale: Vector | AttrFunc<Vector> | undefined): TransformModifier {
    this.getAttrByName("scale")!.value = scale;
    return this;
  }

  getCenter(ctx: AttrContext): Vector {
    return this.evalAttrByName("center", ctx) as Vector;
  }
  setCenter(center: Vector | AttrFunc<Vector> | undefined): TransformModifier {
    this.getAttrByName("center")!.value = center;
    return this;
  }

  plan(rps: OptionalRenderPlan[], innerCtx: AttrContext,): OptionalRenderPlan[] {
    console.assert(rps.length == 1, "Transform should only have one render plan.")

    let a = AffineMatrix.fromTransform({
      position: innerCtx.get("position"),
      rotation: innerCtx.get("rotation"),
      scale: innerCtx.get("scale"),
      center: innerCtx.get("center"),
    });

    rps[0]!.applyTransform(a);

    return rps;
  }
}
