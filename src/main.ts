import { Fill, Transform } from './attributes';
import { Canvas } from './canvas';
import { HSBColor, RGBColor } from './color';
import * as Nodes from './nodes';
import { Vector } from './vector';
import { Timeline } from './timeline';

function main() {
  let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
  c.bgFill = new Fill(new RGBColor(0, 0, 1));

  c.root.fill = new Fill(new RGBColor(1, 1, 0));
  c.root.fill.color = (ctx) => {
    let t = ctx.vars.time as Timeline;
    let r = t.currentFrame / t.logicalFps;
    return new HSBColor(r, 1, 1);
  }

  let r = new Nodes.RectNode(c, 0, 0, 100, 100);
  // r.fill = new Fill(new RGBColor(1, 1, 0));
  r.transform = new Transform();
  r.transform.center = new Vector(50, 50);
  r.transform.position = new Vector(100, 100);
  r.transform.rotation = (ctx: Nodes.NodeDrawContext) => {
    let t = ctx.vars.time as Timeline;
    return t.currentFrame / t.logicalFps / 10;
  }

  c.root.appendChild(r);

  let dctx = new Nodes.NodeDrawContext();
  let time = dctx.vars.time = new Timeline(performance.now());

  let spanCurFrame = document.getElementById('current-frame') as HTMLSpanElement;
  let spanElapsed = document.getElementById('elapsed-time') as HTMLSpanElement;

  function Animate(timeStamp: DOMHighResTimeStamp) {
    time.tick(timeStamp);

    spanCurFrame.textContent = time.currentFrame.toFixed(2);
    spanElapsed.textContent = (time.elapsedTime / 1000).toFixed(2);

    c.renderOnce(dctx);
    requestAnimationFrame(Animate);
  }
  Animate(performance.now());
}

document.addEventListener('DOMContentLoaded', main);