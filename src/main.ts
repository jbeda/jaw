import { Fill } from './attributes';
import { Canvas } from './canvas';
import { RGBColor } from './color';
import { RectNode } from './nodes';

let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
c.root.appendChild(
  new RectNode(c, 10, 10, 100, 100)
    .setFill(new Fill(new RGBColor(1, 1, 0)))
);
c.doRender();