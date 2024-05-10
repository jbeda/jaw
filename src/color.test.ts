import { RGBColor, HSBColor, HSLColor } from './color';

describe('RGBColor', () => {
  it('should convert to CSS string', () => {
    const c = new RGBColor(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('rgb(25.500, 51.000, 76.500, 0.400)');
  });
});

describe('HSBColor', () => {
  it('should convert to CSS string', () => {
    const c = new HSBColor(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('hsl(36.000, 11.111%, 27.000%, 0.400)');
  });
});

describe('HSLColor', () => {
  it('should convert to CSS string', () => {
    const c = new HSLColor(0.1, 0.2, 0.3, 0.4);
    expect(c.toCSSString()).toBe('hsl(36.000, 20.000%, 30.000%, 0.400)');
  });
});