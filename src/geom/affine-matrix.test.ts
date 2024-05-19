import { AffineMatrix } from './affine-matrix';
import { Vector } from '../graphics/vector';

describe('AffineMatrix', () => {
  test('clone', () => {
    const m = new AffineMatrix(1, 2, 3, 4, 5, 6);
    const c = m.clone();
    expect(c.a).toBe(1);
    expect(c.b).toBe(2);
    expect(c.c).toBe(3);
    expect(c.d).toBe(4);
    expect(c.tx).toBe(5);
    expect(c.ty).toBe(6);
  });

  test('mul', () => {
    const m = new AffineMatrix(1, 2, 3, 4, 5, 6);
    const n = new AffineMatrix(7, 8, 9, 10, 11, 12);
    m.mul(n);
    expect(m.a).toBe(31);
    expect(m.b).toBe(46);
    expect(m.c).toBe(39);
    expect(m.d).toBe(58);
    expect(m.tx).toBe(52);
    expect(m.ty).toBe(76);
  });

  test('preMul', () => {
    const m = new AffineMatrix(1, 2, 3, 4, 5, 6);
    const n = new AffineMatrix(7, 8, 9, 10, 11, 12);
    m.preMul(n);
    expect(m.a).toBe(25);
    expect(m.b).toBe(28);
    expect(m.c).toBe(57);
    expect(m.d).toBe(64);
    expect(m.tx).toBe(100);
    expect(m.ty).toBe(112);
  });

  test('invert', () => {
    const m1 = new AffineMatrix()
      .scale(new Vector(2, 3))
      .rotate(0.25)
      .translate(new Vector(4, 5))
      .invert();

    const m2 = new AffineMatrix()
      .translate(new Vector(-4, -5))
      .rotate(-0.25)
      .scale(new Vector(1 / 2, 1 / 3));

    expect(m1.a).toBe(m2.a);
    expect(m1.b).toBe(m2.b);
    expect(m1.c).toBe(m2.c);
    expect(m1.d).toBe(m2.d);
    expect(m1.tx).toBe(m2.tx);
    expect(m1.ty).toBe(m2.ty);
  });

  test('fromTranslate', () => {
    const v = new Vector(7, 8);
    const m = AffineMatrix.fromTranslate(v);
    expect(m.a).toBe(1);
    expect(m.b).toBe(0);
    expect(m.c).toBe(0);
    expect(m.d).toBe(1);
    expect(m.tx).toBe(7);
    expect(m.ty).toBe(8);
  });

  test('translate', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    let t1 = new AffineMatrix(1, 0, 0, 1, 7, 8);
    m1.mul(t1);

    m2.translate(new Vector(7, 8));

    expect(m1.a).toBe(m2.a);
    expect(m1.b).toBe(m2.b);
    expect(m1.c).toBe(m2.c);
    expect(m1.d).toBe(m2.d);
    expect(m1.tx).toBe(m2.tx);
    expect(m1.ty).toBe(m2.ty);
  });

  test('preTranslate', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    m1.preTranslate(new Vector(7, 8));
    m2.preMul(AffineMatrix.fromTranslate(new Vector(7, 8)));

    expect(m1.a).toBeCloseTo(m2.a);
    expect(m1.b).toBeCloseTo(m2.b);
    expect(m1.c).toBeCloseTo(m2.c);
    expect(m1.d).toBeCloseTo(m2.d);
    expect(m1.tx).toBeCloseTo(m2.tx);
    expect(m1.ty).toBeCloseTo(m2.ty);
  });


  test('fromScale (Vector)', () => {
    let m = AffineMatrix.fromScale(new Vector(7, 8));
    expect(m.a).toBe(7);
    expect(m.b).toBe(0);
    expect(m.c).toBe(0);
    expect(m.d).toBe(8);
    expect(m.tx).toBe(0);
    expect(m.ty).toBe(0);
  });

  test('fromScale (number)', () => {
    let m = AffineMatrix.fromScale(7);
    expect(m.a).toBe(7);
    expect(m.b).toBe(0);
    expect(m.c).toBe(0);
    expect(m.d).toBe(7);
    expect(m.tx).toBe(0);
    expect(m.ty).toBe(0);
  });

  test('scale (Vector)', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    let t1 = new AffineMatrix(7, 0, 0, 8, 0, 0);
    m1.mul(t1);

    m2.scale(new Vector(7, 8));

    expect(m1.a).toBe(m2.a);
    expect(m1.b).toBe(m2.b);
    expect(m1.c).toBe(m2.c);
    expect(m1.d).toBe(m2.d);
    expect(m1.tx).toBe(m2.tx);
    expect(m1.ty).toBe(m2.ty);
  });

  test('preScale (Vector)', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    m1.preScale(new Vector(7, 8));
    m2.preMul(AffineMatrix.fromScale(new Vector(7, 8)));

    expect(m1.a).toBe(m2.a);
    expect(m1.b).toBe(m2.b);
    expect(m1.c).toBe(m2.c);
    expect(m1.d).toBe(m2.d);
    expect(m1.tx).toBe(m2.tx);
    expect(m1.ty).toBe(m2.ty);
  });

  test('fromRotate', () => {
    let m = AffineMatrix.fromRotate(1 / 6); // 60 degrees
    let angleRadians = 1 / 6 * 2 * Math.PI;
    let cos = Math.cos(angleRadians);
    let sin = Math.sin(angleRadians);
    expect(m.a).toBeCloseTo(cos);
    expect(m.b).toBeCloseTo(sin);
    expect(m.c).toBeCloseTo(-sin);
    expect(m.d).toBeCloseTo(cos);
    expect(m.tx).toBe(0);
    expect(m.ty).toBe(0);
  });

  test('rotate', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    let angle = 1 / 6;
    m1.rotate(angle); // 60 degrees

    let angleRadians = angle * 2 * Math.PI;
    let cos = Math.cos(angleRadians);
    let sin = Math.sin(angleRadians);
    let t1 = new AffineMatrix(cos, sin, -sin, cos, 0, 0);
    m2.mul(t1);

    expect(m1.a).toBeCloseTo(m2.a);
    expect(m1.b).toBeCloseTo(m2.b);
    expect(m1.c).toBeCloseTo(m2.c);
    expect(m1.d).toBeCloseTo(m2.d);
    expect(m1.tx).toBeCloseTo(m2.tx);
    expect(m1.ty).toBeCloseTo(m2.ty);
  });

  test('preRotate', () => {
    let m1 = new AffineMatrix(1, 2, 3, 4, 5, 6);
    let m2 = m1.clone();

    m1.preRotate(0.25);
    m2.preMul(AffineMatrix.fromRotate(0.25));

    expect(m1.a).toBe(m2.a);
    expect(m1.b).toBe(m2.b);
    expect(m1.c).toBe(m2.c);
    expect(m1.d).toBe(m2.d);
    expect(m1.tx).toBe(m2.tx);
    expect(m1.ty).toBe(m2.ty);
  });
});