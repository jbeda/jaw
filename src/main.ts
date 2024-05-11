import { Fill, Transform } from './attributes';
import { Canvas } from './canvas';
import { HSBColor, RGBColor } from './color';
import * as Nodes from './nodes';
import { Vector } from './vector';
import { Timeline } from './timeline';

function main() {
  let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
  c.bgFill = new Fill(new RGBColor(0, 0, 1));

  c.root.setFill(new Fill()
    .setColor((ctx) => {
      let t = ctx.vars.time as Timeline;
      let r = t.currentFrame / t.logicalFps;
      return new HSBColor(r, 1, 1);
    })
  );

  c.root.appendChild(new Nodes.RectNode(c, 0, 0, 100, 100))
    .setTransform(new Transform()
      .setCenter(new Vector(50, 50))
      .setPosition(new Vector(100, 100))
      .setRotation((ctx) => {
        let t = ctx.vars.time as Timeline;
        return t.currentFrame / t.logicalFps / 10;
      })
    );

  let pctx = new Nodes.PlanContext();
  let time = pctx.vars.time = new Timeline(performance.now());

  let spanCurFrame = document.getElementById('current-frame') as HTMLSpanElement;
  let spanElapsed = document.getElementById('elapsed-time') as HTMLSpanElement;

  function Animate(timeStamp: DOMHighResTimeStamp) {
    time.tick(timeStamp);

    spanCurFrame.textContent = time.currentFrame.toFixed(2);
    spanElapsed.textContent = (time.elapsedTime / 1000).toFixed(2);

    c.renderOnce(pctx);
    requestAnimationFrame(Animate);
  }
  Animate(performance.now());
}

document.addEventListener('DOMContentLoaded', main);