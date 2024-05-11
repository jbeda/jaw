import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Color, RGBColor } from './color';
import { NodeDrawContext } from './nodes';


/** A function to calculate an attribute value. */
export type AttrFunc<T> = (ctx: NodeDrawContext) => T;

/** An Attr can either be a concrete value or a function to return that value.
 * */
export type Attr<T> = T | AttrFunc<T>;

/** Resolve an attribute to a concrete value. */
export function resolveAttr<T>(attr: Attr<T>, ctx: NodeDrawContext): T {
  if (attr instanceof Function) {
    return (attr as (ctx: NodeDrawContext) => T)(ctx);
  }
  return attr as T;
}

/** Make all Attr properties be concrete. */
export type Concrete<T> = {
  [P in keyof T]: T[P] extends Attr<infer U> ? U : T[P];
};

/** Return a Concrete version where all Attr's are resolved to real values. */
export function resolve<T>(
  o: T | undefined, ctx: NodeDrawContext
): Concrete<T> | undefined {
  if (!o) {
    return undefined;
  }

  let ret = {} as Concrete<T>;
  for (let k in o) {
    ret[k as string] = resolveAttr(o[k as keyof T], ctx);
  }
  return ret;
}

export class Fill {
  constructor(color?: Attr<Color>) {
    if (color) {
      this.color = color;
    }
  }

  color: Attr<Color> = new RGBColor(0, 0, 0, 1);
  setColor(color: Attr<Color>): Fill {
    this.color = color;
    return this;
  }
  getColor(ctx: NodeDrawContext): Color {
    return resolveAttr(this.color, ctx);
  }
}

type foo = Extract<keyof Fill, string>;


export class Stroke {
  constructor(color?: Attr<Color>) {
    if (color) {
      this.color = color;
    }
  }

  color: Attr<Color> = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Stroke {
    this.color = color;
    return this;
  }
  getColor(ctx: NodeDrawContext): Color {
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

  position: Attr<Vector> = new Vector(0, 0);
  setPosition(position: Attr<Vector>): Transform {
    this.position = position;
    return this;
  }
  getPosition(ctx: NodeDrawContext): Vector {
    return resolveAttr(this.position, ctx);
  }

  /** A rotation goes from 0 to 1 to ease animation. */
  rotation: Attr<number> = 0;
  setRotation(rotation: Attr<number>): Transform {
    this.rotation = rotation;
    return this;
  }
  getRotation(ctx: NodeDrawContext): number {
    return resolveAttr(this.rotation, ctx);
  }

  scale: Attr<Vector> = new Vector(1, 1);
  setScale(scale: Attr<Vector>): Transform {
    this.scale = scale;
    return this;
  }
  getScale(ctx: NodeDrawContext): Vector {
    return resolveAttr(this.scale, ctx);
  }

  center: Attr<Vector> = new Vector(0, 0);
  setCenter(center: Attr<Vector>): Transform {
    this.center = center;
    return this;
  }
  getCenter(ctx: NodeDrawContext): Vector {
    return resolveAttr(this.center, ctx);
  }

  getMatrix(ctx: NodeDrawContext): AffineMatrix {
    let m = new AffineMatrix();
    m.translate(this.getPosition(ctx));
    m.rotate(this.getRotation(ctx));
    m.scale(this.getScale(ctx));
    m.translate(this.getCenter(ctx).clone().negate());
    return m;
  }
}