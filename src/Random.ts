const MAX = -1 >>> 0;

/**
 * @class Random
 * @see https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
 */
export class Random {
  private x!: number;
  private y!: number;
  private z!: number;
  private w!: number;

  constructor(seed: number = Date.now()) {
    this.resetSeed(seed);
  }

  /**
   * 初期化＋初期シード値セット
   * @param v
   */
  resetSeed(v: number) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = v;
  }

  /**
   * メイン処理
   * XorShiftで次のランダム値を返す
   */
  next() {
    let t;

    t = this.x ^ (this.x << 11);
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    return (this.w = this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8)));
  }

  /**
   * シード値がある以外、Math.randomと一緒
   * @returns 0 ~ 1
   */
  random() {
    return Random.normalize(this.next());
  }

  /**
   * 任意の範囲の整数を得る
   * @param min {number}
   * @param max {number}
   */
  randInt(min: number, max: number) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }

  set seed(v) {
    this.resetSeed(v);
  }
  get seed() {
    return this.w;
  }

  /**
   * 0 ~ 1の間の数字にクランプ
   * @param n
   */
  static normalize(n: number) {
    return (n >>> 0) / MAX;
  }
}
