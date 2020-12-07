/**
 * 二次元Grid
 */
export class GridHelper {
  private _width: number;
  private _height: number;
  private _col: number = 8;
  private _row: number = 8;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  /**
   * マイナスをセットしたときは反対側からの距離を返す
   *
   * @param ratio
   */
  getXByRatio(ratio: number) {
    const partial = this._width * ratio;
    if (ratio < 0) {
      return this._width + partial;
    } else {
      return partial;
    }
  }

  /**
   * マイナスをセットしたときは反対側からの距離を返す
   *
   * @param ratio
   */
  getYByRatio(ratio: number) {
    const partial = this._height * ratio;
    if (ratio < 0) {
      return this._height + partial;
    } else {
      return partial;
    }
  }

  setGrid(row?: number, col?: number) {
    this._row = row || this._row;
    this._col = col || this._col;
  }

  spanX(n: number) {
    return (this._width / this._row) * n;
  }

  spanY(n: number) {
    return (this._height / this._col) * n;
  }

  get w() {
    return this._width;
  }

  get h() {
    return this._height;
  }

  get cx() {
    return this._width * 0.5;
  }

  get cy() {
    return this._height * 0.5;
  }
}
