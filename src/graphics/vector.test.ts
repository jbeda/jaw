import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';

describe('Vector', () => {
  test('clone', () => {
    const v = new Vector(1, 2);
    expect(v.clone()).toEqual(new Vector(1, 2));
  });

  test('negate', () => {
    const v = new Vector(1, 2);
    v.negate();
    expect(v).toEqual(new Vector(-1, -2));
  });

  test('add', () => {
    const v = new Vector(1, 2);
    v.add(new Vector(3, 4));
    expect(v).toEqual(new Vector(4, 6));
  });

  test('addScalar', () => {
    const v = new Vector(1, 2);
    v.addScalar(3);
    expect(v).toEqual(new Vector(4, 5));
  });

  test('sub', () => {
    const v = new Vector(1, 2);
    v.sub(new Vector(3, 4));
    expect(v).toEqual(new Vector(-2, -2));
  });

  test('subScalar', () => {
    const v = new Vector(1, 2);
    v.subScalar(3);
    expect(v).toEqual(new Vector(-2, -1));
  });

  test('mul', () => {
    const v = new Vector(1, 2);
    v.mul(new Vector(3, 4));
    expect(v).toEqual(new Vector(3, 8));
  });

  test('mulScalar', () => {
    const v = new Vector(1, 2);
    v.mulScalar(3);
    expect(v).toEqual(new Vector(3, 6));
  });

  test('div', () => {
    const v = new Vector(1, 2);
    v.div(new Vector(2, 4));
    expect(v).toEqual(new Vector(0.5, 0.5));
  });

  test('divScalar', () => {
    const v = new Vector(1, 2);
    v.divScalar(2);
    expect(v).toEqual(new Vector(0.5, 1));
  });

  test('dot', () => {
    const v = new Vector(1, 2);
    expect(v.dot(new Vector(3, 4))).toBe(11);
  });

  test('cross', () => {
    const v = new Vector(1, 2);
    expect(v.cross(new Vector(3, 4))).toBe(-2);
  });

  test('length', () => {
    const v = new Vector(3, 4);
    expect(v.length()).toBe(5);
  });

  test('lengthSquared', () => {
    const v = new Vector(3, 4);
    expect(v.lengthSquared()).toBe(25);
  });

  test('normalize', () => {
    const v = new Vector(3, 4);
    v.normalize();
    expect(v.length()).toBeCloseTo(1);
  });

  test('lerp', () => {
    const v = new Vector(1, 2);
    v.lerp(new Vector(3, 4), 0.5);
    expect(v).toEqual(new Vector(2, 3));
  });

  test('transform', () => {
    const v = new Vector(1, 2);
    v.transform(new AffineMatrix()
      .scale(new Vector(0.5, 2))
      .rotate(-0.25)
      .translate(new Vector(1, 2))
    );

    // Start with 1, 2
    // Translate by 1, 2 -> 2, 4
    // Rotate by 0.25 -> 4, -2
    // Scale by 0.5, 2 -> 2, -4
    expect(v.x).toBeCloseTo(2);
    expect(v.y).toBeCloseTo(-4);
  });

  test('rotate', () => {
    const v = new Vector(1, 2);
    v.rotate(-0.25);
    expect(v.x).toBeCloseTo(2);
    expect(v.y).toBeCloseTo(-1);
  });

  test('distance', () => {
    const v = new Vector(1, 2);
    expect(v.distance(new Vector(4, 6))).toBeCloseTo(5);
  });

  test('distanceSquared', () => {
    const v = new Vector(1, 2);
    expect(v.distanceSquared(new Vector(4, 6))).toBeCloseTo(25);
  });

});