import { toRadian, toDegree } from "./radianConverter";
import { Vec2Like } from "./Vec2Like";

const TWO_PI = Math.PI * 2;

export class Vector2 {
  private _x: number;
  private _y: number;

  constructor(x = 0, y = 0) {
    this._x = x;
    this._y = y;
  }

  mul(v: number) {
    this._x *= v;
    this._y *= v;
    return this;
  }

  /**
   * ベクトルを反転する
   *
   * Inverse vector
   */
  inverse() {
    return this.mul(-1);
  }

  rotate(angleRadian: number, pivotX: number = 0, pivotY: number = 0) {
    const fromPivotX = this._x - pivotX;
    const fromPivotY = this._y - pivotY;
    const x2 =
      fromPivotX * Math.cos(angleRadian) - fromPivotY * Math.sin(angleRadian);
    const y2 =
      fromPivotX * Math.sin(angleRadian) + fromPivotY * Math.cos(angleRadian);
    return this.set(pivotX + x2, pivotY + y2);
  }

  rotateByDegree(angleDegree: number, pivotX: number = 0, pivotY: number = 0) {
    return this.rotate(toRadian(angleDegree), pivotX, pivotY);
  }

  /**
   * @param wallNormalVec
   */
  reflectAngle(wallNormalVec: Vec2Like) {
    this.setFromRadian(Vector2.reflectedAngle(this, wallNormalVec));
  }

  normalize(): this {
    const len = this.length;
    if (len !== 0) {
      this._x /= len;
      this._y /= len;
    }
    return this;
  }

  /**
   * [en] Sets the length of vector
   *
   * [jp] ベクトル長を設定
   *
   * @param len
   */
  setLength(len: number) {
    const rad = this.getAngleByRadian();
    this._x = Math.cos(rad) * len;
    this._y = Math.sin(rad) * len;
    return this;
  }

  clone(vectorRef?: Vector2) {
    if (!vectorRef) vectorRef = new Vector2();
    vectorRef.x = this._x;
    vectorRef.y = this._y;
    return vectorRef;
  }

  set(x = this._x, y = this._y): this {
    this._x = x;
    this._y = y;
    return this;
  }

  copyFrom(v: Vec2Like) {
    this._x = v.x;
    this._y = v.y;
    return this;
  }

  setFromRadian(rad: number, len: number = 1) {
    this._x = Math.cos(rad) * len;
    this._y = Math.sin(rad) * len;
    return this;
  }

  setFromDegree(deg: number, len: number = 1) {
    const rad = toRadian(deg);
    return this.setFromRadian(rad, len);
  }

  getAngleByRadian() {
    const angleRad = Math.atan2(this.y, this.x);
    return (angleRad + TWO_PI) % TWO_PI;
  }

  getAngleByDegree() {
    return toDegree(this.getAngleByRadian());
  }

  get x() {
    return this._x;
  }
  set x(v: number) {
    this._x = v;
  }

  get y() {
    return this._y;
  }
  set y(v: number) {
    if (isNaN(v)) {
      // console.error('You cannot set NaN')
      return;
    }
    this._y = v;
  }

  get angle() {
    return this.getAngleByRadian();
  }

  get length() {
    return Math.sqrt(Math.pow(this._x, 2) + Math.pow(this._y, 2));
  }
  set length(v) {
    this.setLength(v);
  }

  get lengthSquared() {
    return Math.pow(this._x, 2) + Math.pow(this._y, 2);
  }

  /**
   * xyベクトルから角度（度数単位）を算出
   * @param dx
   * @param dy
   * @returns -180 ~ 180の数字
   */
  static getVectorDegree(dx: number, dy: number): number {
    const theta = Math.atan2(dy, dx);
    const deg = theta * (180 / Math.PI);
    // if (deg < 0) {
    //   // -180 ~ 0
    //   return Math.round(deg + 360);
    // } else {
    //   // 0 ~ 180
    //   return Math.round(deg);
    // }
    // return Math.round(deg);
    return deg;
  }

  static distanceSquared(rhs: Vec2Like, lhs: Vec2Like) {
    return Math.pow(rhs.x - lhs.x, 2) + Math.pow(rhs.y - lhs.y, 2);
  }

  /**
   * 内積
   * @param a
   * @param b
   * @returns
   */
  static dot(a: Vec2Like, b: Vec2Like) {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * 外積
   * @param a
   * @param b
   */
  static cross(a: Vec2Like, b: Vec2Like) {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * R = F + 2(−F⋅N) * N
   * R: Reflect vector, F: Force input vector, N: Normal vector
   * @see https://qiita.com/edo_m18/items/b145f2f5d2d05f0f29c9
   *
   * @param d Src direction vector (No mutation)
   * @param n Wall normal vector  (No mutation)
   * @param vec Vector2 to store the value (Mutated)
   * @returns Vector2
   */
  static reflectVector(
    d: Vec2Like,
    n: Vec2Like,
    vec: Vector2 = new Vector2()
  ): Vector2 {
    // Calc: 2 * (−F⋅N)
    const a = 2 * -this.dot(d, n);
    vec.set(
      d.x + a * n.x, // x
      d.y + a * n.y // y
    );
    return vec;
  }

  /**
   * @param d Src direction vector (No mutation)
   * @param n Wall normal vector (No mutation)
   * @returns Reflected vector's angle by radian
   */
  static reflectedAngle(d: Vec2Like, n: Vec2Like): number {
    return this.reflectVector(d, n, innerSharedVec).getAngleByRadian();
  }

  static reflectedAngleByDegree(d: Vec2Like, n: Vec2Like): number {
    return this.reflectVector(d, n, innerSharedVec).getAngleByDegree();
  }

  /**
   * 角度（ラジアン）からVector2を生成
   *
   * @param radian
   * @param length
   */
  static createFromRadian(radian: number, length?: number) {
    return new Vector2(0, 0).setFromRadian(radian, length);
  }

  /**
   * 角度（度数）からVector2を生成
   *
   * @param degree
   * @param length Length of vector default:1
   */
  static createFromDegree(degree: number, length?: number) {
    return new Vector2(0, 0).setFromDegree(degree, length);
  }
}

const innerSharedVec: Vector2 = new Vector2();
