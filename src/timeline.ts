/** Provides a frame counter. 
 *
 * Typically used in the passed down context to be evaluated during the planning
 * pass. 
 */
export class Timeline {
  /** 
   * @param timestamp The starting time in milliseconds from some epoch 
   * @param [logicalFps=30] The frames per second to use for the timeline.
  */
  constructor(timestamp: number, logicalFps = 30) {
    this.logicalFps = logicalFps;
    this.#startTimestamp = timestamp;
    this.#tickTimestamp = timestamp;
  }

  readonly logicalFps: number;

  /** The current frame number based on fps and when the Timeline was reset/started.
   * 
   * Can be a fractional number.
   */
  get currentFrame(): number {
    return this.#currentFrame;
  }
  #currentFrame: number = 0;

  /** The elapsed time between this frame and the previous frame. */
  get frameTime(): number {
    return this.#frameTime;
  }
  #frameTime: number = Number.POSITIVE_INFINITY;

  get elapsedTime(): number {
    return this.#elapsedTime;
  }
  #elapsedTime: number = 0;

  #startTimestamp: number;
  #tickTimestamp: number;

  tick(timestamp: number): void {
    this.#frameTime = timestamp - this.#tickTimestamp;
    this.#tickTimestamp = timestamp;
    this.#elapsedTime = timestamp - this.#startTimestamp;
    this.#currentFrame = (this.#elapsedTime / 1000) * this.logicalFps;
  }
}