import p5 from 'p5';
import { Color } from './color';

export interface Drawable {
  p: p5;
  draw(): void;
}

export interface Fillable {
  fill?: Color;
}

export interface Strokeable {
  // todo: do other stroke attriburtes
  stroke?: Color;
}