// All colors go from 0 to 1.0 in various color modes.

export enum COLOR_MODE {
  RGB = "rgb",
  HSB = "hsb",
  HSL = "hsl"
}

export class Color {
  v1: number;
  v2: number;
  v3: number;
  a: number = 1.0;

  mode: COLOR_MODE = COLOR_MODE.RGB;

  constructor(v1: number, v2: number, v3: number, a: number = 1.0, mode: COLOR_MODE = COLOR_MODE.RGB) {
    this.v1 = v1;
    this.v2 = v2;
    this.v3 = v3;
    this.a = a;
    this.mode = mode;
  }

  /** Create an RGB Color
   * @param r Red value from 0 to 1.0
   * @param g Green value from 0 to 1.0
   * @param b Blue value from 0 to 1.0
   * @param a Alpha value from 0 to 1.0
   */
  static createRGB(r: number, g: number, b: number, a: number = 1.0): Color {
    return new Color(r, g, b, a, COLOR_MODE.RGB);
  }

  /** Create an HSB color
   * @param h Hue value from 0 to 1.0
   * @param s Saturation value from 0 to 1.0
   * @param b Brightness value from 0 to 1.0
   * @param a Alpha value from 0 to 1.0
   */
  static createHSB(h: number, s: number, b: number, a: number = 1.0): Color {
    return new Color(h, s, b, a, COLOR_MODE.HSB);
  }

  /** Create an HSL Color 
   * @param h Hue value from 0 to 1.0
   * @param s Saturation value from 0 to 1.0
   * @param l Lightness value from 0 to 1.0
   * @param a Alpha value from 0 to 1.0
  */
  static createHSL(h: number, s: number, l: number, a: number = 1.0): Color {
    return new Color(h, s, l, a, COLOR_MODE.HSL);
  }

  clone(): Color {
    return new Color(this.v1, this.v2, this.v3, this.a, this.mode);
  }

  toCSSString(): string {
    switch (this.mode) {
      case COLOR_MODE.RGB:
        return `rgb(${(this.v1 * 255).toFixed(3)}, ${(this.v2 * 255).toFixed(3)}, `
          + `${(this.v3 * 255).toFixed(3)}, ${this.a.toFixed(3)})`;
      case COLOR_MODE.HSB:
        let h = this.v1;
        let s_hsb = this.v2;
        let b_hsb = this.v3;

        let l_hsl = b_hsb * (1 - s_hsb / 2);
        let s_hsl;
        if (l_hsl == 0 || l_hsl == 1) {
          s_hsb = 0;
        } else {
          s_hsl = (b_hsb - l_hsl) / Math.min(l_hsl, 1 - l_hsl);
        }
        return `hsl(${(h * 360).toFixed(3)}, ${(s_hsl * 100).toFixed(3)}%, `
          + `${(l_hsl * 100).toFixed(3)}%, ${this.a.toFixed(3)})`;
      case COLOR_MODE.HSL:
        return `hsl(${(this.v1 * 360).toFixed(3)}, ${(this.v2 * 100).toFixed(3)}%, `
          + `${(this.v3 * 100).toFixed(3)}%, ${this.a.toFixed(3)})`;
    }
  }
}


