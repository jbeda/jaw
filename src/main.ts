import { Fill, Transform } from './attributes';
import { Canvas } from './canvas';
import { RGBColor } from './color';
import * as Nodes from './nodes';
import { Vector } from './vector';
import { Timeline } from './timeline';

let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
c.bgFill = new Fill(new RGBColor(0, 0, 1));

c.root.fill = new Fill(new RGBColor(1, 1, 0));

let r = new Nodes.RectNode(c, 0, 0, 100, 100);
// r.fill = new Fill(new RGBColor(1, 1, 0));
r.transform = new Transform();
r.transform.center = new Vector(50, 50);
r.transform.position = new Vector(100, 100);
r.transform.rotation.v = (ctx: Nodes.NodeDrawContext) => {
  let t = ctx.vars.time as Timeline;
  return t.currentFrame / 1000;
}

c.root.appendChild(r);

let dctx = new Nodes.NodeDrawContext();
let time = dctx.vars.time = new Timeline(performance.now());


function Animate(timeStamp: DOMHighResTimeStamp) {
  time.tick(timeStamp);
  c.renderOnce(dctx);
  requestAnimationFrame(Animate);
}
Animate(performance.now());