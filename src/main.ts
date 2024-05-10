import { Fill, Transform } from './attributes';
import { Canvas } from './canvas';
import { RGBColor } from './color';
import * as Nodes from './nodes';
import { Vector } from './vector';

let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
c.bgFill = new Fill(new RGBColor(0, 0, 1));

let r = new Nodes.RectNode(c, 0, 0, 100, 100)
  .setFill(new Fill(new RGBColor(1, 1, 0)));
r.transform = new Transform();
r.transform.center = new Vector(50, 50);
r.transform.position = new Vector(100, 100);
r.transform.rotation = 1 / 6;

c.root.appendChild(r);
c.doRender();