import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';
import { Color, RGBColor } from './color';

export type CoreAttribute = number | string | boolean | Color | Vector;


/** Holds a set of attributes. */
export abstract class AttributeSet {
  constructor(enabled = true) {
    this.enabled = enabled;
  }

  enabled: boolean = true;
  enable(): void {
    this.enabled = true;
  }
  disable(): void {
    this.enabled = false;
  }
}

export class Fill extends AttributeSet {
  constructor(color?: Color, enabled = true) {
    super(enabled);
    if (color) {
      this.color = color;
    }
  }

  static createDefault(): Fill {
    return new Fill(undefined, false);
  }

  color: Color = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Fill {
    this.color = color;
    return this;
  }
}

export class Stroke extends AttributeSet {
  constructor(color?: Color, enabled = true) {
    super(enabled);
    if (color) {
      this.color = color;
    }
  }

  static createDefault(): Stroke {
    return new Stroke(undefined, false);
  }

  color: Color = new RGBColor(0, 0, 0, 1);
  setColor(color: Color): Stroke {
    this.color = color;
    return this;
  }
}

/** Core transformation information. Applied in order: scale, rotation and then translate. */
export class Transform extends AttributeSet {
  constructor(
    position?: Vector,
    rotation?: number,
    scale?: Vector,
    center?: Vector,
    enabled = true
  ) {
    super(enabled);
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

  static createDefault(): Transform {
    return new Transform(undefined, undefined, undefined, undefined, false);
  }

  position: Vector = new Vector(0, 0);
  setPosition(position: Vector): Transform {
    this.position = position;
    return this;
  }

  /** A rotation goes from 0 to 1 to ease animation. */
  rotation: number = 0;
  setRotation(rotation: number): Transform {
    this.rotation = rotation;
    return this;
  }

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

  getMatrix(): AffineMatrix {
    let m = new AffineMatrix();
    m.translate(this.position);
    m.rotate(this.rotation);
    m.scale(this.scale);
    m.translate(this.center.negate());
    return m;
  }
}