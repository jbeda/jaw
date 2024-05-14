import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Color, RGBColor } from './color';
import { PlanContext } from './nodes';
import { Cloneable } from './util';

/** Each attribute is one of these types */
export type CoreAttrTypes = number | string | boolean | Vector | Color;

/** A function to calculate an attribute value. */
export type AttrFunc<T extends CoreAttrTypes> = (ctx: PlanContext) => T;

/** An Attr can either be a concrete value or a function to return that value. */
export type Attr<T extends CoreAttrTypes> = T | AttrFunc<T>;

function hasCloneFunction<T>(obj: any): obj is Cloneable<T> {
  return obj.clone instanceof Function;
}

export function cloneCoreAttrType<T extends CoreAttrTypes | undefined>(attr?: T): T {
  if (attr === undefined) {
    return undefined as T;
  }

  if (hasCloneFunction(attr)) {
    return attr.clone() as T;
  }
  return attr;
}

/** Clone an attribute if possible */
export function cloneAttr<T extends CoreAttrTypes>(attr: Attr<T>): Attr<T> {
  if (attr instanceof Function) {
    return attr;
  }

  if (hasCloneFunction(attr)) {
    return attr.clone() as T;
  }

  return attr;
}

/** Resolve an attribute to a concrete value. */
export function resolveAttr<T extends CoreAttrTypes>(attr: Attr<T>, ctx: PlanContext): T {
  if (attr instanceof Function) {
    return (attr as (ctx: PlanContext) => T)(ctx);
  }
  return attr as T;
}

/** A bag of attributes. */
export interface AttrBag {
  [key: string]: Attr<any>;
};

/** Make all Attr properties be concrete. */
export type Concrete<T extends AttrBag> = {
  [P in keyof T]: T[P] extends Attr<infer U> | undefined ? U : T[P];
};

export function cloneConcreteAttrBag
  <U extends AttrBag, T extends Concrete<U>>
  (o: T | undefined): T | undefined {
  if (o === undefined) {
    return undefined;
  }

  let ret = {} as T;
  for (let k in o) {
    ret[k] = cloneCoreAttrType(o[k]);
  }
  return ret;
}

/** Return a Concrete version where all Attr's are resolved to real values. */
export function resolve<T extends AttrBag>(
  o: T | undefined, ctx: PlanContext
): Concrete<T> | undefined {
  if (!o) {
    return undefined;
  }

  let ret = {} as Concrete<T>;
  for (let k in o) {
    ret[k] = resolveAttr(o[k as keyof T], ctx);
  }
  return ret;
}

export class Fill implements AttrBag {
  constructor(color?: Attr<Color>) {
    if (color) {
      this.color = color;
    }
  }

  clone(): Fill {
    return new Fill(cloneAttr(this.color));
  }

  color: Attr<Color> = new RGBColor(0, 0, 0, 1);
  setColor(color: Attr<Color>): Fill {
    this.color = color;
    return this;
  }
  getColor(ctx: PlanContext): Color {
    return resolveAttr(this.color, ctx);
  }
}

export class Stroke implements AttrBag {
  constructor(color?: Attr<Color>) {
    if (color) {
      this.color = color;
    }
  }

  clone(): Stroke {
    return new Stroke(cloneAttr(this.color));
  }

  color: Attr<Color> = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Stroke {
    this.color = color;
    return this;
  }
  getColor(ctx: PlanContext): Color {
    return resolveAttr(this.color, ctx);
  }
}

/** Core transformation information. Applied in order: scale, rotation and then translate. */
export class Transform {
  constructor(
    position?: Attr<Vector>,
    rotation?: Attr<number>,
    scale?: Attr<Vector>,
    center?: Attr<Vector>,
  ) {
    if (position) {
      this.position = position;
    }
    if (rotation) {
      this.rotation = rotation;
    }
    if (scale) {
      this.scale = scale;
    }
    if (center) {
      this.center = center;
    }
  }

  clone(): Transform {
    return new Transform(
      cloneAttr(this.position),
      cloneAttr(this.rotation),
      cloneAttr(this.scale),
      cloneAttr(this.center),
    );
  }

  position: Attr<Vector> = new Vector(0, 0);
  setPosition(position: Attr<Vector>): Transform {
    this.position = position;
    return this;
  }
  getPosition(ctx: PlanContext): Vector {
    return resolveAttr(this.position, ctx);
  }

  /** A rotation goes from 0 to 1 to ease animation. */
  rotation: Attr<number> = 0;
  setRotation(rotation: Attr<number>): Transform {
    this.rotation = rotation;
    return this;
  }
  getRotation(ctx: PlanContext): number {
    return resolveAttr(this.rotation, ctx);
  }

  scale: Attr<Vector> = new Vector(1, 1);
  setScale(scale: Attr<Vector>): Transform {
    this.scale = scale;
    return this;
  }
  getScale(ctx: PlanContext): Vector {
    return resolveAttr(this.scale, ctx);
  }

  center: Attr<Vector> = new Vector(0, 0);
  setCenter(center: Attr<Vector>): Transform {
    this.center = center;
    return this;
  }
  getCenter(ctx: PlanContext): Vector {
    return resolveAttr(this.center, ctx);
  }

  getMatrix(ctx: PlanContext): AffineMatrix {
    let m = new AffineMatrix();
    m.translate(this.getPosition(ctx));
    m.rotate(this.getRotation(ctx));
    m.scale(this.getScale(ctx));
    m.translate(this.getCenter(ctx).clone().negate());
    return m;
  }
}