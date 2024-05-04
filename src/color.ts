// All colors go from 0 to 1.0 in various color modes.

export enum COLOR_MODE {
  RGB = "rgb",
  HSB = "hsb",
  HSL = "hsl"
}

export interface Color {
  v1, v2, v3, a: number
  mode: COLOR_MODE;
}

export class RGBColor implements Color {
  mode = COLOR_MODE.RGB;
  a: number;
  constructor(public v1: number, public v2: number, public v3: number, a?: number) {
    if (a === undefined) {
      this.a = 1.0;
    }
  }
}

export class HSBColor implements Color {
  mode = COLOR_MODE.HSB;
  a: number;
  constructor(public v1: number, public v2: number, public v3: number, a?: number) {
    if (a === undefined) {
      this.a = 1.0;
    }
  }
}

export class HSLColor implements Color {
  mode = COLOR_MODE.HSL;
  a: number;
  constructor(public v1: number, public v2: number, public v3: number, a?: number) {
    if (a === undefined) {
      this.a = 1.0;
    }
  }
}


