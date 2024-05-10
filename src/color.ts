// All colors go from 0 to 1.0 in various color modes.

export enum COLOR_MODE {
  RGB = "rgb",
  HSB = "hsb",
  HSL = "hsl"
}

export interface Color {
  v1, v2, v3, a: number
  mode: COLOR_MODE;

  toCSSString(): string;
}

export class RGBColor implements Color {
  mode = COLOR_MODE.RGB;
  constructor(public v1: number, public v2: number, public v3: number, public a: number = 1.0) { }

  toCSSString(): string {
    return `rgb(${(this.v1 * 255).toFixed(3)}, ${(this.v2 * 255).toFixed(3)}, `
      + `${(this.v3 * 255).toFixed(3)}, ${this.a.toFixed(3)})`;
  }
}

export class HSBColor implements Color {
  mode = COLOR_MODE.HSB;
  constructor(public v1: number, public v2: number, public v3: number, public a: number = 1.0) {
  }

  toCSSString(): string {
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
  }
}

export class HSLColor implements Color {
  mode = COLOR_MODE.HSL;
  constructor(public v1: number, public v2: number, public v3: number, public a: number = 1.0) { }

  toCSSString(): string {
    return `hsl(${(this.v1 * 360).toFixed(3)}, ${(this.v2 * 100).toFixed(3)}%, `
      + `${(this.v3 * 100).toFixed(3)}%, ${this.a.toFixed(3)})`;
  }
}


