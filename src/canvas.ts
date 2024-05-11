import { Fill } from './attributes';
import { Color, RGBColor } from './color';
import { GroupNode, PlanContext } from './nodes';
import { RenderContext } from './render-primitive';

/** Canvas the top level object that holds the root Node and knows how to
 * coordinate rendering that to an underlying HTML Canvas element. */
export class Canvas {

  constructor(cel: HTMLCanvasElement) {
    this.#canvasElement = cel;
    this.#ctx = this.#canvasElement.getContext('2d') as CanvasRenderingContext2D;
    this.#height = cel.height;
    this.#width = cel.width;
  }

  #canvasElement: HTMLCanvasElement;
  get canvasElement(): HTMLCanvasElement {
    return this.#canvasElement;
  }

  #ctx: CanvasRenderingContext2D;
  get ctx(): CanvasRenderingContext2D {
    return this.#ctx;
  }

  #height: number;
  get height(): number {
    return this.#height;
  }

  #width: number;
  get width(): number {
    return this.#width;
  }

  bgFill: Fill = new Fill(new RGBColor(0, 0, 0, 1));

  #root: GroupNode = new GroupNode();
  get root(): GroupNode {
    return this.#root;
  }

  clear(color: Color): void {
    this.#ctx.fillStyle = color.toCSSString();
    this.#ctx.fillRect(0, 0, this.#width, this.#height);
  }

  renderOnce(pctx: PlanContext): void {
    if (this.bgFill) {
      let fillStyle = this.bgFill.getColor(pctx).toCSSString();
      this.#ctx.fillStyle = fillStyle;
      this.#ctx.fillRect(0, 0, this.#width, this.#height);
    }

    pctx = pctx.clone();
    let dp = this.#root.plan(pctx);

    if (dp) {
      dp.htmlCanvasRender(this.#ctx, new RenderContext());
    }
  }
}

/**  A Modifier can be attached to a Node. Only one instance of each type of
 * Modifier can be attached at a time. */
export abstract class Modifier {

  // If the modifier is disabled, it will not show up when queried, by default.
  enabled: boolean = true;
}
