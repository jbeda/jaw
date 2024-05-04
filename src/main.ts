import p5 from "p5";

const sketch = (p: p5) => {
  let size = 50;
  p.setup = () => {
    p.createCanvas(800, 800);
  };

  p.draw = () => {
    p.background(40);
    p.noStroke();
    p.translate(p.width / 2, p.height / 2);
    let wave = p.sin(p.radians(p.frameCount)) * 50;
    let wave2 = p.cos(p.radians(p.frameCount)) * 50;
    p.circle(wave, wave2, size);
    p.circle(wave2, wave, size);
  };
};

new p5(sketch);