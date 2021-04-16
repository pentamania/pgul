/**
 *
 */
export class Timer {
  private _past: number;
  private _elapsedTime: number;
  private _isRunning: boolean;

  constructor() {
    this._past = 0;
    this._elapsedTime = 0;
    this._isRunning = false;
  }

  getElapsedTime(tofixed: number, divideNum: number) {
    let time =
      divideNum !== undefined
        ? this._elapsedTime / divideNum
        : this._elapsedTime;
    if (tofixed !== undefined) {
      return time.toFixed(tofixed);
    } else {
      return time;
    }
  }

  run() {
    this._isRunning = true;
    this._tick();
  }

  stop() {
    this._isRunning = false;
    this._past = 0;
  }

  toggle() {
    if (!this._isRunning) {
      this.run();
    } else {
      this.stop();
    }
  }

  reset() {
    this._elapsedTime = 0;
    this._past = 0;
  }

  private _tick() {
    if (!this._isRunning) return;

    requestAnimationFrame(this._tick.bind(this));

    if (this._past === 0) {
      this._past = this.now;
      // console.log('refill');
    } else {
      const now = this.now;
      let delta = now - this._past;
      this._elapsedTime += delta;
      this._past = now;
    }
  }

  get now(): number {
    return performance.now();
  }

  get milisec(): number {
    return this._elapsedTime;
  }

  get sec(): number {
    return this._elapsedTime / 1000;
  }
}
