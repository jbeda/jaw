import { AffineMatrix } from './affine-matrix';
import { Vector } from './vector';

enum SegmentType {
  LINE,         // 1 point for a line
  CUBIC_BEZIER  // 3 points total: 2 control points and an end point for a cubic bezier
}

export class Path {
  readonly subpaths: Array<SubPath> = new Array<SubPath>();

  newSubPath(start: Vector, closed: boolean = true): SubPath {
    let subpath = new SubPath(start, closed);
    this.subpaths.push(subpath);
    return subpath;
  }

  applyTransform(transform: AffineMatrix): void {
    for (let sp of this.subpaths) {
      sp.applyTransform(transform);
    }
  }
}

export class SubPath {
  constructor(start: Vector, closed: boolean = true) {
    this.#start = start;
    this.closed = closed;
  }

  applyTransform(transform: AffineMatrix) {
    this.#start.transform(transform);
    for (let cp of this.#controlPoints) {
      cp.transform(transform);
    }
  }


  lineTo(end: Vector): void {
    this.#segmentTypes.push(SegmentType.LINE);
    this.#controlPoints.push(end);
  }

  bezierTo(control1: Vector, control2: Vector, end: Vector): void {
    this.#segmentTypes.push(SegmentType.CUBIC_BEZIER);
    this.#controlPoints.push(control1);
    this.#controlPoints.push(control2);
    this.#controlPoints.push(end);
  }

  addToCanvasPath(ctx: CanvasRenderingContext2D, path2d: Path2D): void {
    path2d.moveTo(this.#start.x, this.#start.y);
    let ixp = 0;
    for (let t of this.#segmentTypes) {
      switch (t) {
        case SegmentType.LINE:
          path2d.lineTo(this.#controlPoints[ixp].x, this.#controlPoints[ixp].y);
          ixp++;
          break;
        case SegmentType.CUBIC_BEZIER:
          path2d.bezierCurveTo(
            this.#controlPoints[ixp].x, this.#controlPoints[ixp].y,
            this.#controlPoints[ixp + 1].x, this.#controlPoints[ixp + 1].y,
            this.#controlPoints[ixp + 2].x, this.#controlPoints[ixp + 2].y,
          );
          ixp += 3;
          break;
      }
    }
    if (this.closed) {
      path2d.closePath();
    }
  }

  // TODO: Add methods to read/iterate the points.

  #start: Vector;

  // Each path segment has an entry in the segmentTypes array. And the
  // corresponding points in the controlPoints array.  The only way to get
  // segments is to iterate.
  #segmentTypes: Array<SegmentType> = new Array<SegmentType>();
  #controlPoints: Array<Vector> = new Array<Vector>();

  closed: boolean = true;
}