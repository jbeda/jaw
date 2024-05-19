import { Color } from './color';

describe('Color', () => {
  it('should create RGB color', () => {
    const c = new Color(0.1, 0.2, 0.3, 0.4);
    expect(c.v1).toBe(0.1);
    expect(c.v2).toBe(0.2);
    expect(c.v3).toBe(0.3);
    expect(c.a).toBe(0.4);
    expect(c.mode).toBe('rgb');
  });

  it('should convert RGB to CSS string', () => {
    const c = new Color(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('rgb(25.500, 51.000, 76.500, 0.400)');
  });

  it('should create HSB color', () => {
    const c = Color.createHSB(0.1, 0.2, 0.3, 0.4);
    expect(c.v1).toBe(0.1);
    expect(c.v2).toBe(0.2);
    expect(c.v3).toBe(0.3);
    expect(c.a).toBe(0.4);
    expect(c.mode).toBe('hsb');
  });

  it('should convert HSB to CSS string', () => {
    const c = Color.createHSB(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('hsl(36.000, 11.111%, 27.000%, 0.400)');
  });

  it('should create HSL color', () => {
    const c = Color.createHSL(0.1, 0.2, 0.3, 0.4);
    expect(c.v1).toBe(0.1);
    expect(c.v2).toBe(0.2);
    expect(c.v3).toBe(0.3);
    expect(c.a).toBe(0.4);
    expect(c.mode).toBe('hsl');
  });

  it('should convert HSL to CSS string', () => {
    const c = Color.createHSL(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('hsl(36.000, 20.000%, 30.000%, 0.400)');
  });

  it('should clone color', () => {
    const c = new Color(0.1, 0.2, 0.3, 0.4);
    const c2 = c.clone();
    expect(c2.v1).toBe(0.1);
    expect(c2.v2).toBe(0.2);
    expect(c2.v3).toBe(0.3);
    expect(c2.a).toBe(0.4);
    expect(c2.mode).toBe('rgb');
  });
});