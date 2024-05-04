import p5 from 'p5';
import { Drawable, Fillable, Strokeable } from './interface';
import { RGBColor, Color } from './color';


abstract class ShapeBase implements Drawable, Fillable, Strokeable {
  p: p5;

  public fill?: Color;
  public stroke?: Color;

  constructor(p: p5) {
    this.p = p;
    this.fill = new RGBColor(128, 128, 128);
    this.stroke = new RGBColor(128, 128, 128);
  }

  setP5State(): void {
    if (this.fill !== undefined) {
      this.p.colorMode(this.fill.mode as any, 1.0);
      this.p.fill(this.fill.v1, this.fill.v2, this.fill.v3, this.fill.a);
    }
    if (this.stroke !== undefined) {
      this.p.colorMode(this.stroke.mode as any, 1.0);
      this.p.stroke(this.stroke.v1, this.stroke.v2, this.stroke.v3, this.stroke.a);
    }
  }

  draw(): void {
  }
}

export class Square extends ShapeBase {
  constructor(p: p5, private x: number, private y: number, private size: number) {
    super(p);
  }

  draw(): void {
    this.setP5State();
    this.p.rect(this.x, this.y, this.size, this.size);
  }
}