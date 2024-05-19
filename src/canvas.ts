import { Color } from './graphics/color';
import { GroupNode } from './nodes';
import { RenderContext, RenderFill } from './graphics/render-plan';
import { AttrBag, AttrContext, AttrFunc, DynamicAttr } from './attributes';

/** Canvas the top level object that holds the root Node and knows how to
 * coordinate rendering that to an underlying HTML Canvas element. */
export class Canvas extends AttrBag {

  constructor(cel: HTMLCanvasElement) {
    super();

    this.attrs.push(new DynamicAttr("bgColor", new Color(0, 0, 0, 1)));

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

  getBgColor(ctx: AttrContext): Color | undefined {
    return this.evalAttrByName("bgColor", ctx) as Color | undefined;
  }
  setBgColor(color: Color | AttrFunc<Color> | undefined): Canvas {
    this.getAttrByName("bgColor")!.value = color;
    return this;
  }

  #root: GroupNode = new GroupNode();
  get root(): GroupNode {
    return this.#root;
  }

  clear(color: Color): void {
    this.#ctx.fillStyle = color.toCSSString();
    this.#ctx.fillRect(0, 0, this.#width, this.#height);
  }

  renderOnce(attrCtx: AttrContext): void {
    let innerCtx = new AttrContext(attrCtx);
    let bgColor = innerCtx.get("bgColor") as Color;

    if (bgColor != undefined) {
      this.clear(bgColor);
    }

    let dp = this.#root.plan(attrCtx);

    if (dp) {
      dp.htmlCanvasRender(this.#ctx, new RenderContext());
    }
  }
}

