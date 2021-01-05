import { LooseVector2 } from "./interfaces";
import { toRadian, toDegree } from "./utils/radianConverter";

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

  normalize(): this {
    const len = this.length;
    if (len) {
      this._x /= len;
      this._y /= len;
    }
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

  static distanceSquared(rhs: LooseVector2, lhs: LooseVector2) {
    return Math.pow(rhs.x - lhs.x, 2) + Math.pow(rhs.y - lhs.y, 2);
  }
}
