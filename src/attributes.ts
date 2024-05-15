import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Color } from './color';
import { PlanContext } from './nodes';

//==============================================================================
// ConcreteAttrTypes

/** Each attribute is one of these types */
export type ConcreteAttrTypes = number | string | boolean | Vector | Color;

export function cloneConcreteAttrType<T extends ConcreteAttrTypes | undefined>(attr: T): T {
  if (attr === undefined) {
    return undefined as T;
  }

  if (attr instanceof Vector) {
    return attr.clone() as T;
  }

  if (attr instanceof Color) {
    return attr.clone() as T;
  }

  return attr;
}

//==============================================================================
// ConcreteAttrBag

export type ConcreteAttrBag<T> = {
  [P in keyof T]: T[P] | undefined;
}

export function cloneConcreteAttrBag<T>(o: ConcreteAttrBag<T>): ConcreteAttrBag<T> {
  let ret = {} as ConcreteAttrBag<T>;
  for (let k in o) {
    ret[k] = cloneConcreteAttrType(o[k] as any);
  }
  return ret;
}

export function cloneOptionalConcreteAttrBag<T>(o: ConcreteAttrBag<T> | undefined): ConcreteAttrBag<T> | undefined {
  if (o === undefined) {
    return undefined;
  }
  return cloneConcreteAttrBag(o);
}

//==============================================================================
// DynamicAttr

/** A function to calculate an attribute value. */
export type AttrFunc<T extends ConcreteAttrTypes> = (ctx: PlanContext) => T;

/** An Attr can either be a concrete value or a function to return that value. */
export type DynamicAttr<T extends ConcreteAttrTypes> = T | AttrFunc<T>;

export type OptionalDynamicAttr<T extends ConcreteAttrTypes> = DynamicAttr<T> | undefined;

/** Clone an attribute */
export function cloneDynamicAttr<T extends ConcreteAttrTypes>(attr: DynamicAttr<T>): DynamicAttr<T> {
  if (attr instanceof Function) {
    return attr;
  }

  return cloneConcreteAttrType(attr);
}

/** Clone an optional attribute */
export function cloneOptionalDynamicAttr<T extends ConcreteAttrTypes>(attr: OptionalDynamicAttr<T>): OptionalDynamicAttr<T> {
  if (attr === undefined) {
    return undefined;
  }

  return cloneDynamicAttr(attr);
}

/** Resolve an attribute to a concrete value. */
export function resolveDynamicAttr<T extends ConcreteAttrTypes>(attr: DynamicAttr<T>, ctx: PlanContext): T {
  if (attr instanceof Function) {
    return (attr as (ctx: PlanContext) => T)(ctx);
  }
  return attr;
}

/** Resolve an optional attribute to a concrete value. */
export function resolveOptionalDynamicAttr<T extends ConcreteAttrTypes>(attr: OptionalDynamicAttr<T>, ctx: PlanContext): T | undefined {
  if (attr === undefined) {
    return undefined;
  }

  return resolveDynamicAttr(attr, ctx);
}

//==============================================================================
// DynamicAttrBag

/** A bag of dynamic attributes defined by a ConcreteAttrBag */
export type DynamicAttrBag<T extends ConcreteAttrBag<T>> = {
  // OK -- this is super complex and probalby not justified.  But I got the damn
  // thing working.  I couldn't figure out a better way to do this.
  // If the attribute type is a ConcreteAttrType, then just turn it into a
  // dynamic Attr.
  // If the attribute type is a ConcreteAttrType | undefined, then turn it into
  // a DynamicAttr (based on the type without undefined) | undefined.
  // If none of these apply then don't include the attribute at all.
  [P in keyof T]:
  T[P] extends ConcreteAttrTypes
  ? DynamicAttr<T[P]>
  : T[P] extends ConcreteAttrTypes | undefined
  /**/ ? DynamicAttr<Exclude<T[P], undefined>> | undefined
  /**/ : never;
};


export function cloneDynamicAttrBag<T extends ConcreteAttrBag<T>>(
  o: DynamicAttrBag<T>
): DynamicAttrBag<T> {
  let ret = {} as DynamicAttrBag<T>;
  for (let k in o) {
    ret[k] = cloneOptionalDynamicAttr(o[k]) as any;
  }
  return ret;
}

export function cloneOptionalDynamicAttrBag<T extends ConcreteAttrBag<T>>(
  o: DynamicAttrBag<T> | undefined
): DynamicAttrBag<T> | undefined {
  if (o === undefined) {
    return undefined;
  }
  return cloneDynamicAttrBag(o);
}

/** Resolve every member of a DynamicAttrBag and return a ConcreteAttrBag. */
export function resolve<T extends ConcreteAttrBag<T>>(
  o: DynamicAttrBag<T>, ctx: PlanContext
): ConcreteAttrBag<T> {
  let ret = {} as ConcreteAttrBag<T>;
  for (let k in o) {
    ret[k] = o[k] !== undefined ? resolveDynamicAttr(o[k]!, ctx) : undefined;
  }
  return ret;
}

export function resolveOptional<T extends ConcreteAttrBag<T>>(
  o: DynamicAttrBag<T> | undefined, ctx: PlanContext
): ConcreteAttrBag<T> | undefined {
  if (o === undefined) {
    return undefined;
  }
  return resolve(o, ctx);
}

//==============================================================================
// GenericAttrBag

export type GenericAttrBag = {
  [key: string]: ConcreteAttrTypes | undefined;
}

export type DynamicGenericAttrBag = DynamicAttrBag<GenericAttrBag>;

//==============================================================================
// Fill

export type Fill = {
  color?: Color;
}
export type DynamicFill = DynamicAttrBag<Fill>;

//==============================================================================
// Stroke

export type Stroke = {
  color?: Color;
}

export type DynamicStroke = DynamicAttrBag<Stroke>;

//==============================================================================

/** Core transformation information. Applied in order: scale, rotation and then translate. */
export type Transform = {
  position?: Vector;
  rotation?: number;
  scale?: Vector;
  center?: Vector;
}

export type DynamicTransform = DynamicAttrBag<Transform>;

export function getTransformMatrix(t: DynamicTransform | undefined, ctx: PlanContext): AffineMatrix | undefined {

  if (t === undefined) {
    return undefined;
  }

  let ct = resolve(t, ctx);

  let m = new AffineMatrix();
  if (ct.position) {
    m.translate(ct.position);
  }
  if (ct.rotation) {
    m.rotate(ct.rotation);
  }
  if (ct.scale) {
    m.scale(ct.scale);
  }
  if (ct.center) {
    m.translate(ct.center.clone().negate());
  }

  return m;
}
