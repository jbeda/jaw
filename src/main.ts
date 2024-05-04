import p5 from "p5";
import { Square } from "./shapes";
import { RGBColor } from "./color";

const sketch = (p: p5) => {
  let size = 50;
  let square: Square;
  p.setup = () => {
    p.createCanvas(800, 800);
    square = new Square(p, 100, 100, size);
    square.fill = new RGBColor(255, 0, 0);
    square.stroke = new RGBColor(0, 0, 255);
  };

  p.draw = () => {
    p.background(255);
    square.draw();
  };
};

new p5(sketch);