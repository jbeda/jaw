import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Color, RGBColor } from './color';
import { NodeDrawContext } from './nodes';

export class Attribute<T> {
  constructor(value: T | ((ctx: NodeDrawContext) => T)) {
    this.v = value;
  }
  v: T | ((ctx: NodeDrawContext) => T);

  get(ctx: NodeDrawContext): T {
    if (this.v instanceof Function) {
      return (this.v as (ctx: NodeDrawContext) => T)(ctx);
    }
    return this.v as T;
  }
}

export class Fill {
  constructor(color?: Color) {
    if (color) {
      this.color = color;
    }
  }

  color: Color = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Fill {
    this.color = color;
    return this;
  }
}

export class Stroke {
  constructor(color?: Color) {
    if (color) {
      this.color = color;
    }
  }


  color: Color = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Stroke {
    this.color = color;
    return this;
  }
}

/** Core transformation information. Applied in order: scale, rotation and then translate. */
export class Transform {
  constructor(
    position?: Vector,
    rotation?: number,
    scale?: Vector,
    center?: Vector,
  ) {
    if (position) {
      this.position = position;
    }
    if (rotation) {
      this.rotation.v = rotation;
    }
    if (scale) {
      this.scale = scale;
    }
    if (center) {
      this.center = center;
    }
  }

  position: Vector = new Vector(0, 0);
  setPosition(position: Vector): Transform {
    this.position = position;
    return this;
  }

  /** A rotation goes from 0 to 1 to ease animation. */
  rotation: Attribute<number> = new Attribute(0);

  scale: Vector = new Vector(1, 1);
  setScale(scale: Vector): Transform {
    this.scale = scale;
    return this;
  }

  center: Vector = new Vector(0, 0);
  setCenter(center: Vector): Transform {
    this.center = center;
    return this;
  }

  getMatrix(ctx: NodeDrawContext): AffineMatrix {
    let m = new AffineMatrix();
    m.translate(this.position);
    m.rotate(this.rotation.get(ctx));
    m.scale(this.scale);
    m.translate(this.center.clone().negate());
    return m;
  }
}