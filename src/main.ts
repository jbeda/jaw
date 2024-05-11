import { Fill, Transform } from './attributes';
import { Canvas } from './canvas';
import { HSBColor, RGBColor } from './color';
import * as Nodes from './nodes';
import { Vector } from './vector';
import { Timeline } from './timeline';

function main() {
  let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
  c.clear(new RGBColor(0, 0, 0, 1));

  // Create a "motion blur" effect by using an alpha channel to clear the
  // background.  Since we don't have a fixed frame rate, base it on the frame
  // time and aim for a 100ms fade.
  c.bgFill = new Fill((ctx) => {
    return new RGBColor(0, 0, 0, ctx.vars.time.frameTime / 1000 * 10);
  });

  c.root.setFill(new Fill()
    .setColor((ctx) => {
      let t = ctx.vars.time as Timeline;
      let r = t.currentFrame / t.logicalFps;
      return new HSBColor(r, 1, 1);
    })
  );

  c.root.appendChild(new Nodes.PolygonNode(7, 80))
    .setTransform(new Transform()
      .setPosition(new Vector(100, 100))
      .setRotation((ctx) => {
        let t = ctx.vars.time as Timeline;
        return t.currentFrame / t.logicalFps / 10;
      })
    );

  c.root.appendChild(new Nodes.circleNode(50))
    .setTransform(new Transform()
      .setPosition(new Vector(200, 200))
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