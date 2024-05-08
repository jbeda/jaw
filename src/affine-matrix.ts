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

  invert(): AffineMatrix {
    const { a, b, c, d, tx, ty } = this;
    const ad_minus_bc = a * d - b * c;
    const bc_minus_ad = b * c - a * d;

    this.a = d / ad_minus_bc;
    this.b = b / bc_minus_ad;
    this.c = c / bc_minus_ad;
    this.d = a / ad_minus_bc;
    this.tx = (d * tx - c * ty) / bc_minus_ad;
    this.ty = (b * tx - a * ty) / ad_minus_bc;

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

  preTranslate(v: Vector): AffineMatrix {
    this.tx += v.x;
    this.ty += v.y;
    return this;
  }

  static fromScale(s: Vector | number): AffineMatrix {
    if (typeof s === 'number') {
      return new AffineMatrix(s, 0, 0, s, 0, 0);
    }
    return new AffineMatrix(s.x, 0, 0, s.y, 0, 0);
  }

  scale(v: Vector | number): AffineMatrix {
    let x: number, y: number;
    if (typeof v === 'number') {
      x = y = v;
    } else {
      ({ x, y } = v);
    }

    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
  }


  preScale(v: Vector): AffineMatrix {
    const { x, y } = v;

    this.a *= x;
    this.b *= y;
    this.c *= x;
    this.d *= y;
    this.tx *= x;
    this.ty *= y;
    return this;
  }

  /**
   * @param angle The angle to rotate from 0 to 1 counterclockwise
   */
  static fromRotate(angle: number): AffineMatrix {
    const cos = Math.cos(angle * 2 * Math.PI);
    const sin = Math.sin(angle * 2 * Math.PI);
    return new AffineMatrix(cos, sin, -sin, cos, 0, 0);
  }

  /**
   * @param angle The angle to rotate from 0 to 1 counterclockwise
   */
  rotate(angle: number): AffineMatrix {
    this.mul(AffineMatrix.fromRotate(angle));
    return this;
  }

  /**
   * @param angle The angle to rotate from 0 to 1 counterclockwise
   */
  preRotate(angle: number): AffineMatrix {
    this.preMul(AffineMatrix.fromRotate(angle));
    return this;
  }

}