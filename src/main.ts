import { Canvas } from './canvas';
import { Color } from './graphics/color';
import * as Nodes from './nodes';
import { Vector } from './graphics/vector';
import { Timeline } from './timeline';
import { LinearRepeat } from './modifiers';
import { AttrContext } from './attributes';

function main() {
  let c = new Canvas(document.getElementById('canvas') as HTMLCanvasElement);
  c.clear(new Color(0, 0, 0, 1));

  // Create a "motion blur" effect by using an alpha channel to clear the
  // background.  Since we don't have a fixed frame rate, base it on the frame
  // time and aim for a 100ms fade.
  c.setBgColor((ctx) => {
    let frameTime = (ctx.get('time')! as Timeline).frameTime;
    return new Color(0, 0, 0, frameTime / 1000 * 10);
  });

  c.root.fill.setColor((ctx) => {
    let t = ctx.get("time") as Timeline;
    let r = t.currentFrame / t.logicalFps;
    return Color.createHSB(r, 1, 1);
  });

  // c.root.customModifiers.push(
  //   new LinearRepeat(3, new Vector(50, 0), 'repeatIndex'));

  let n = c.root.appendChild(new Nodes.PolygonNode(7, 80));
  n.transform
    .setPosition(new Vector(100, 100))
    .setRotation((ctx) => {
      let t = ctx.get("time") as Timeline;
      return t.currentFrame / t.logicalFps / 10;
    });

  c.root.appendChild(new Nodes.circleNode(50))
    .transform.setPosition(new Vector(200, 200));


  let pctx = new AttrContext();
  let time = new Timeline(performance.now());
  pctx.set('time', time);

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