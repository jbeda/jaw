import { Vector } from './vector';

export class AffineMatrix {
  /*
  Assumes column vectors.  Matrix of form:

  | a  c tx |
  | b  d ty |
  | 0  0  1 |

  */
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;

  constructor(a: number = 1, b: number = 0,
    c: number = 0, d: number = 1,
    tx: number = 0, ty: number = 0) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  clone(): AffineMatrix {
    return new AffineMatrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  mul(m: AffineMatrix): AffineMatrix {
    const { a, b, c, d, tx, ty } = this;
    this.a = a * m.a + c * m.b;
    this.b = b * m.a + d * m.b;
    this.c = a * m.c + c * m.d;
    this.d = b * m.c + d * m.d;
    this.tx = a * m.tx + c * m.ty + tx;
    this.ty = b * m.tx + d * m.ty + ty;
    return this;
  }

  preMul(m: AffineMatrix): AffineMatrix {
    const { a, b, c, d, tx, ty } = this;
    this.a = m.a * a + m.c * b;
    this.b = m.b * a + m.d * b;
    this.c = m.a * c + m.c * d;
    this.d = m.b * c + m.d * d;
    this.tx = m.a * tx + m.c * ty + m.tx;
    this.ty = m.b * tx + m.d * ty + m.ty;
    return this;
  }

  static fromTranslate(v: Vector): AffineMatrix {
    return new AffineMatrix(1, 0, 0, 1, v.x, v.y);
  }

  translate(v: Vector): AffineMatrix {
    const { x, y } = v;
    const { a, b, c, d } = this;
    this.tx += a * x + c * y;
    this.ty += b * x + d * y;
    return this;
  }

  static fromScale(s: Vector | number): AffineMatrix {
    if (typeof s === 'number') {
      return new AffineMatrix(s, 0, 0, s, 0, 0);
    }
    return new AffineMatrix(s.x, 0, 0, s.y, 0, 0);
  }

  scale(v: Vector): AffineMatrix {
    const { x, y } = v;
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
  }

  /**
   * @param angle The angle to rotate from 0 to 1
   */
  static fromRotate(angle: number): AffineMatrix {
    const cos = Math.cos(angle * 2 * Math.PI);
    const sin = Math.sin(angle * 2 * Math.PI);
    return new AffineMatrix(cos, sin, -sin, cos, 0, 0);
  }

  /**
   * @param angle The angle to rotate from 0 to 1
   */
  rotate(angle: number): AffineMatrix {
    const cos = Math.cos(angle * 2 * Math.PI);
    const sin = Math.sin(angle * 2 * Math.PI);
    const { a, b, c, d } = this;
    this.a = a * cos + c * sin;
    this.b = b * cos + d * sin;
    this.c = c * cos - a * sin;
    this.d = d * cos - b * sin;
    return this;
  }

}