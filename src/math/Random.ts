const MAX = -1 >>> 0;

/**
 * [en]
 * Random Generator controllable with seed
 *
 * [jp]
 * シード値設定可能なランダム値生成クラス
 *
 * @see https://sbfl.net/blog/2017/06/01/javascript-reproducible-random/
 */
export class Random {
  private x!: number;
  private y!: number;
  private z!: number;
  private w!: number;

  /**
   * @param seed default: Data.now
   */
  constructor(seed: number = Date.now()) {
    this.resetSeed(seed);
  }

  /**
   * 初期化＋初期シード値セット
   *
   * @param v
   */
  resetSeed(v: number) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = v;
  }

  /**
   * XorShiftでパラメータ更新＋次のランダム値を返す
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
   *
   * @returns float ranging from 0 to 1
   */
  random() {
    return Random.normalize(this.next());
  }

  /**
   * 任意の範囲の整数を得る
   *
   * @param min {number}
   * @param max {number}
   */
  randInt(min: number, max: number) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }

  /**
   * 任意の範囲の浮動小数点を得る
   *
   * @param min {number}
   * @param max {number}
   */
  randFloat(min: number, max: number) {
    return min + this.random() * (max - min);
  }

  set seed(v) {
    this.resetSeed(v);
  }
  get seed() {
    return this.w;
  }

  /**
   * 0 ~ 1の間の数字にクランプ
   *
   * @param n
   */
  static normalize(n: number) {
    return (n >>> 0) / MAX;
  }
}
