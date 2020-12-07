/**
 * @class Random
 * @see https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
 * @param seed
 */

export const Random = class {
  x: number;
  y: number;
  z: number;
  w: number;

  constructor(seed: number = Date.now()) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed;
  }

  // XorShift
  next() {
    let t;

    t = this.x ^ (this.x << 11);
    this.x = this.y; this.y = this.z; this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));
  }

  /**
   * randInt
   * @param min {number}
   * @param max {number}
   */
  randInt(min: number, max: number) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }

  set seed(v) {
    this.w = v;
  }
  get seed() {
    return this.w;
  }

}