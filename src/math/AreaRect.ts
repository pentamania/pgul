import { LooseVector2 } from "../utilTypes";
import clamp from "../utils/clamp";
import { Vector2 } from "./Vector2";

export class AreaRect {
  private _top: number;
  private _left: number;
  private _right: number;
  private _bottom: number;

  constructor(left: number, top: number, right: number, bottom: number) {
    this._left = left;
    this._top = top;
    this._right = right;
    this._bottom = bottom;
  }

  /**
   * オブジェクトがエリア内に収まるよう補正する
   * @param obj x,yプロパティをもつオブジェクト
   */
  clamp(obj: LooseVector2) {
    obj.x = clamp(obj.x, this.left, this.right);
    obj.y = clamp(obj.y, this.top, this.bottom);
  }

  /**
   * 座標がエリア枠内にあるかどうか
   *
   * @param x
   * @param y
   * @param offset
   */
  outOfRect(x: number, y: number, offset: number = 0): boolean {
    return (
      x < this.left - offset ||
      this.right + offset < x ||
      y < this.top - offset ||
      this.bottom + offset < y
    );
  }

  withinBound(x: number, y: number): boolean {
    return !this.outOfRect(x, y);
  }

  ratioX(n: number) {
    return this._left + this.width * n;
  }

  ratioY(n: number) {
    return this._top + this.height * n;
  }

  /**
   * [en]
   * Calculate left/right/top/bottom and line intercepting points
   *
   * [jp]
   * 直線式と矩形の上下左右交点4点を取得
   *
   * @param lineSlope 傾き
   * @param lineYIntercept 切片
   * @returns Vector2 Map
   */
  calcLineInterceptPoints(lineSlope: number, lineYIntercept: number) {
    // Define x/y calculation func
    // TODO :lineSlopeが0のときゼロ除算になるのを避ける
    const getY = (x: number) => lineSlope * x + lineYIntercept;
    const getX = (y: number) => (y - lineYIntercept) / lineSlope;

    const top = new Vector2(getX(this.top), this.top);
    const right = new Vector2(this.right, getY(this.right));
    const bottom = new Vector2(getX(this.bottom), this.bottom);
    const left = new Vector2(this.left, getY(this.left));
    return {
      top,
      right,
      bottom,
      left,
    };
  }

  get left() {
    return this._left;
  }
  get top() {
    return this._top;
  }
  get right() {
    return this._right;
  }
  get bottom() {
    return this._bottom;
  }

  get width() {
    return this._right - this._left;
  }
  get height() {
    return this._bottom - this._top;
  }

  /** 対角線長さ */
  get diagonalLength() {
    return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2));
  }

  get centerX() {
    return this.width / 2;
  }
  get centerY() {
    return this.height / 2;
  }
}
