import { AffineMatrix } from './affine-matrix';

export class Vector {
  constructor(public x: number = 0, public y: number = 0) {
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  add(v: Vector): Vector {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s: number): Vector {
    this.x += s;
    this.y += s;
    return this;
  }

  sub(v: Vector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  subScalar(s: number): Vector {
    this.x -= s;
    this.y -= s;
    return this;
  }

  mul(v: Vector): Vector {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  mulScalar(s: number): Vector {
    this.x *= s;
    this.y *= s;
    return this;
  }

  div(v: Vector): Vector {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  divScalar(s: number): Vector {
    this.x /= s;
    this.y /= s;
    return this;
  }

  dot(v: Vector): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector): number {
    return this.x * v.y - this.y * v.x;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  normalize(): Vector {
    const len = this.length();
    if (len > 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  lerp(v: Vector, t: number): Vector {
    this.x += (v.x - this.x) * t;
    this.y += (v.y - this.y) * t;
    return this;
  }

  transform(affineMatrix: AffineMatrix) {
    const { x, y } = this;
    const { a, b, c, d, tx, ty } = affineMatrix;
    this.x = a * x + c * y + tx;
    this.y = b * x + d * y + ty;
    return this;
  }

  /**
 * @param angle The angle to rotate from 0 to 1 counterclockwise
 */

  rotate(angle: number): Vector {
    const cos = Math.cos(angle * 2 * Math.PI);
    const sin = Math.sin(angle * 2 * Math.PI);
    const x = this.x;
    const y = this.y;
    this.x = x * cos - y * sin;
    this.y = x * sin + y * cos;
    return this;
  }

  distance(v: Vector) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceSquared(v: Vector) {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return dx * dx + dy * dy;
  }
}