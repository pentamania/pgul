/**
 * 二次元Grid
 */
export class Grid2D {
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

  /**
   * Set grid by grid width & height
   *
   * @param colWidth Column width
   * @param rowHeight Row height: colWidth will be used when undefined
   * @param toIntMethod Set Math methods to convert to int
   */
  setGridFromSize(
    colWidth: number,
    rowHeight: number = colWidth,
    toIntMethod?: "ceil" | "floor" | "round"
  ) {
    this._col = this._width / colWidth;
    this._row = this._height / rowHeight;
    if (toIntMethod) {
      let func;
      switch (toIntMethod) {
        case "ceil":
          func = Math.ceil;
          break;
        case "floor":
          func = Math.floor;
          break;
        case "round":
          func = Math.round;
          break;
      }
      if (func) {
        this._col = func(this._col);
        this._row = func(this._row);
      }
    }
  }

  spanX(n: number) {
    return (this._width / this._row) * n;
  }

  spanY(n: number) {
    return (this._height / this._col) * n;
  }

  /**
   * Do something for each grid
   *
   * @param cb Callback
   */
  gridForEach(
    cb: (x: number, y: number, colIndex: number, rowIndex: number) => any
  ) {
    let gridWidth = this._width / this._col;
    let gridHeight = this._height / this._row;

    for (let ri = 0; ri < this._row; ri++) {
      const y = gridHeight * ri;
      for (let ci = 0; ci < this._col; ci++) {
        cb(gridWidth * ci, y, ci, ri);
      }
    }
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
