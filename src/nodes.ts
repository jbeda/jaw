import { Modifier } from 'typescript';
import { Fill, Stroke, Transform } from './attributes';
import { Canvas } from './canvas';
import { DrawGroup, DrawPrimitive, Path } from './draw-primitive';
import { Vector } from './vector';

/** A thing that can contribute to rendering on a canvas. */
export abstract class BaseNode {
  constructor(c: Canvas) {
    this.canvas = c;
  }

  readonly canvas: Canvas;

  parent?: BaseNode;

  get children(): Array<BaseNode> | undefined {
    return undefined;
  }

  fill: Fill = Fill.createDefault();
  setFill(fill: Fill): BaseNode {
    this.fill = fill;
    return this;
  }
  stroke: Stroke = Stroke.createDefault();
  setStroke(stroke: Stroke): BaseNode {
    this.stroke = stroke;
    return this;
  }
  transform: Transform = Transform.createDefault();
  setTransform(transform: Transform): BaseNode {
    this.transform = transform;
    return this;
  }
  readonly modifiers: Array<Modifier> = new Array<Modifier>();

  abstract draw(): DrawPrimitive | undefined;

}

export class GroupNode extends BaseNode {
  constructor(c: Canvas) {
    super(c);
  }

  #children: Array<BaseNode> = new Array<BaseNode>();
  get children(): Array<BaseNode> {
    return this.#children;
  }

  appendChild<T extends BaseNode>(n: T): T {
    n.parent = this;
    this.#children.push(n);
    return n;
  }

  prependChild<T extends BaseNode>(n: T): T {
    n.parent = this;
    this.#children.unshift(n);
    return n;
  }

  draw(): DrawPrimitive | undefined {
    if (this.children.length == 0) {
      return undefined;
    }

    let dp = new DrawGroup();
    for (let c of this.children) {
      let cdp = c.draw();
      if (cdp) {
        dp.children.push(cdp);
      }
    }
    return dp;
  }
}

export class RectNode extends BaseNode {
  constructor(c: Canvas, x: number, y: number, width: number, height: number) {
    super(c);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  x: number;
  y: number;
  width: number;
  height: number;

  draw(): DrawPrimitive {
    let dp = new Path();
    let sp = dp.newSubPath(new Vector(this.x, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y + this.height));
    sp.lineTo(new Vector(this.x, this.y + this.height));
    sp.closed = true;

    dp.fill = this.fill;
    dp.stroke = this.stroke;
    return dp;
  }
}