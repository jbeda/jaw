import { Group, Node } from './nodes';


/** Canvas is the root thing that gets drawn. */
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

  #root: Group = new Group(this);
  get root(): Group {
    return this.#root;
  }

  doRender(): void {
    this.#ctx.fillStyle = "red";
    this.#ctx.fillRect(0, 0, this.#width, this.#height);
    let dp = this.#root.draw();
    if (dp) {
      dp.htmlCanvasRender(this.#ctx);
    }
  }
}

/**  A Modifier can be attached to a Node. Only one instance of each type of
 * Modifier can be attached at a time. */
export abstract class Modifier {

  // If the modifier is disabled, it will not show up when queried, by default.
  enabled: boolean = true;

  // If dynamic is set to false, the modifier cannot be removed from the node.
  dynamic: boolean = true;
}
