import { Modifier } from 'typescript';
import { Fill, Stroke, Transform } from './attributes';
import { Canvas } from './canvas';
import { RenderGroup, RenderPrimitive, RenderPath } from './render-primitive';
import { Vector } from './vector';
import { AffineMatrix } from './affine-matrix';

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

  fill?: Fill;
  setFill(fill: Fill): BaseNode {
    this.fill = fill;
    return this;
  }
  stroke?: Stroke;
  setStroke(stroke: Stroke): BaseNode {
    this.stroke = stroke;
    return this;
  }
  transform?: Transform;
  setTransform(transform: Transform): BaseNode {
    this.transform = transform;
    return this;
  }
  readonly modifiers: Array<Modifier> = new Array<Modifier>();

  draw(ctx: NodeDrawContext): RenderPrimitive | undefined {
    let c = ctx.clone();
    let m = this.transform?.getMatrix();
    if (m) {
      c.matrix = c.matrix.mul(m);
    }

    let rp = this.drawImpl(c);

    if (rp && m) {
      rp.transform = m.clone();
    }
    return rp;
  }

  /** Subclasses implement this to return their drawing primitives.
   * 
   * Override this method to implement drawing for your node.  The context will
   * automatically have your transform applied to it.  In addition, it will be
   * applied to all of your primitives automatically as you return.
   */
  protected abstract drawImpl(ctx: NodeDrawContext): RenderPrimitive | undefined;

}

export class NodeDrawContext {
  matrix: AffineMatrix = new AffineMatrix();

  clone(): NodeDrawContext {
    let c = new NodeDrawContext();
    c.matrix = this.matrix.clone();
    return c;
  }

  // TODO: implement attribute inheritance.
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

  drawImpl(ctx: NodeDrawContext): RenderPrimitive | undefined {
    if (this.children.length == 0) {
      return undefined;
    }

    let rp = new RenderGroup();
    for (let c of this.children) {
      let crp = c.draw(ctx);
      if (crp) {
        rp.children.push(crp);
      }
    }
    return rp;
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

  drawImpl(ctx: NodeDrawContext): RenderPrimitive {
    let rp = new RenderPath();
    let sp = rp.newSubPath(new Vector(this.x, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y));
    sp.lineTo(new Vector(this.x + this.width, this.y + this.height));
    sp.lineTo(new Vector(this.x, this.y + this.height));
    sp.closed = true;

    rp.fill = this.fill;
    rp.stroke = this.stroke;
    return rp;
  }
}