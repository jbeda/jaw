import { Vector } from './graphics/vector';
import { AffineMatrix } from './graphics/affine-matrix';
import { Color } from './graphics/color';

//==============================================================================
/** Holds a set of values that are the context for evaluating Attrs.
 * 
 * Will look up a chain to find the first value that is defined.
 */
// TODO: consider using proxies to do magic stuff to ease usage.
// Q: Do we just store concrete values or store dynamic values with memoization
export class AttrContext {
  readonly #parent: AttrContext | undefined;
  readonly #values: Map<string, any> = new Map();
  #locked: boolean = false;

  constructor(parent?: AttrContext | undefined, values?: { [key: string]: any }) {
    this.#parent = parent;
    if (values) {
      this.setAll(values);
    }
  }

  /** Once locked, an AttrContext can no longer be modified */
  lock(): AttrContext {
    this.#locked = true;
    return this;
  }

  /** Get an attribute value. */
  get(name: string): any {
    if (this.#values.get(name)) {
      return this.#values.get(name);
    }
    return this.#parent?.get(name) ?? undefined;
  }

  /** Set an attribute value. */
  set(name: string, value: any): AttrContext {
    if (this.#locked) {
      throw new Error('Cannot modify a locked AttrContext');
    }
    this.#values.set(name, value);
    return this;
  }

  /** Bulk set a bunch of attributes. */
  setAll(values: { [key: string]: any }): AttrContext {
    if (this.#locked) {
      throw new Error('Cannot modify a locked AttrContext');
    }
    for (let key of Object.keys(values)) {
      this.set(key, values[key]);
    }
    return this;
  }

  /** Check if an attribute is defined. */
  has(name: string): boolean {
    return this.#values.has(name) || (this.#parent?.has(name) ?? false);
  }
}

//==============================================================================
// CoreAttrTypes

/** Each attribute is one of these types */
export type CoreAttrTypes = number | string | boolean | Vector | Color;

export function cloneCoreAttrType<T extends CoreAttrTypes | undefined>(attr: T): T {
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
// DynamicAttr

/** A function to calculate an attribute value. */
export type AttrFunc<T extends CoreAttrTypes> = (ctx: AttrContext) => T;
export type DynamicAttrValue = CoreAttrTypes | AttrFunc<CoreAttrTypes> | undefined;

/** A DynamicAttr can either be a concrete value or a function to return that
 * value. */
export class DynamicAttr {
  name: string = "";
  value: DynamicAttrValue;

  constructor(name: string, value: DynamicAttrValue) {
    this.name = name;
    this.value = value;
  }

  clone(): DynamicAttr {
    if (this.value instanceof Function) {
      return new DynamicAttr(this.name, this.value);
    }

    return new DynamicAttr(this.name, cloneCoreAttrType(this.value));
  }

  eval(ctx: AttrContext): CoreAttrTypes | undefined {
    if (this.value instanceof Function) {
      return this.value(ctx);
    }
    return this.value;
  }
}

//==============================================================================
// AttrBag

/** A bag of dynamic attributes. This is meant to be a base class for any class
 * with dynamic attrs. 
 * 
 * The set of Atts is added at runtime  
 */
export class AttrBag {
  attrs: DynamicAttr[] = [];

  /** Evaluate all attrs with ctx and add them to ctx. */
  evalAllToContext(ctx: AttrContext): void {
    // Note that we currently don't let attrs depend on each other. Because of
    // this we collect all of the results and add them to the ctx at the end.
    let results: { [key: string]: CoreAttrTypes | undefined } = {};
    for (let a of this.attrs) {
      // Throw error if name already exists?
      results[a.name] = a.eval(ctx);
    }
    ctx.setAll(results);
  }

  getAttrByName(name: string): DynamicAttr | undefined {
    return this.attrs.find((a) => a.name === name);
  }

  evalAttrByName(name: string, ctx: AttrContext): CoreAttrTypes | undefined {
    let attr = this.getAttrByName(name);
    if (attr === undefined) {
      return undefined;
    }
    return attr.eval(ctx);
  }
}
