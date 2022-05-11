import { Random } from "./Random";

/**
 * 配列をゲーム向けに使いやすくするためのクラス
 */
export class List<T = any> {
  protected _list: T[];
  private _pointerIndex = 0;
  protected _random?: Random;
  protected _limitSize?: number;

  /**
   * @param items 追加する要素。REST parameterでいくつでも追加可能
   */
  constructor(...items: T[]) {
    this._list = items;
  }

  /**
   * 通常はArray.pushと同じ
   * ただしサイズが設定されている場合、
   * サイズ超過時に頭の要素が押し出されて返却される
   *
   * 複数pushした場合、押し出した分を配列として返却
   *
   * @param arg
   */
  push(...arg: T[]): number | T | T[] {
    const newLength = this._list.push(...arg);
    if (this._limitSize && this._limitSize < newLength) {
      const shifted = [];
      while (this._limitSize < this._list.length) {
        shifted.push(this._list.shift()!);
      }
      if (shifted.length > 1) {
        return shifted;
      } else {
        return shifted[0];
      }
    }
    return newLength;
  }

  /**
   * Array.popラッパー
   */
  pop() {
    return this._list.pop();
  }

  /**
   * 複製した内部配列を返す（シャロ―クローン）
   */
  getList() {
    return this._list.slice(0);
  }

  /**
   * 内部インデックス値を設定しつつ、対応する要素を返す
   * （内部処理用）
   *
   * @param i
   */
  protected _setIndexAndReturnValue(i: number): T {
    this._pointerIndex = i;
    return this._list[this._pointerIndex];
  }

  /**
   * 内部インデックス値を設定しつつ、対応する要素を返す
   * 範囲外のインデックス値はセットできず、undefinedを返す
   *
   * @param i index
   *
   * @returns
   * [jp] インデックスに対応する要素。セットできなかったら場合はundefined
   */
  setIndex(i: number): T | undefined {
    if (i < 0 || this.lastIndex < i) {
      // TODO：デバッグビルド時にエラー出す
      return undefined;
    }
    return this._setIndexAndReturnValue(i);
  }

  /**
   * 内部インデックス値を進めながら、対応する要素を返す.
   *
   * @param loop
   * インデックスをオーバーしたときループするかどうか（default: true）
   * falseの場合、オーバーしそうになったら最大インデックスで固定
   */
  increment(loop = true): T {
    let nextIndex = this._pointerIndex + 1;
    if (this.lastIndex < nextIndex) {
      nextIndex = loop ? 0 : this.lastIndex;
    }
    return this._setIndexAndReturnValue(nextIndex);
  }

  /**
   * 内部インデックス値を減じながら、対応する要素を返す.
   *
   * @param loop
   * インデックスをオーバーしたときループするかどうか
   * falseの場合、オーバーしそうになったら0で固定
   */
  decrement(loop = true): T {
    let nextIndex = this._pointerIndex - 1;
    if (nextIndex < 0) {
      nextIndex = loop ? this.lastIndex : 0;
    }
    return this._setIndexAndReturnValue(nextIndex);
  }

  /**
   * 内部ポインタインデックス値がリスト先頭にあるかどうか
   */
  isPointerAtFirst(): boolean {
    return this._pointerIndex === 0;
  }

  /**
   * 内部ポインタインデックス値がリスト終端にあるかどうか
   */
  isPointerAtLast(): boolean {
    return this._pointerIndex === this.lastIndex;
  }

  /**
   * リストサイズ値を取得
   *
   * @returns サイズ値、未設定のときはundefined
   */
  getSize(): number | undefined {
    return this._limitSize;
  }

  /**
   * リストのサイズ（格納可能な要素数）を設定する
   *
   * @param v
   */
  setSize(v: number): void {
    if (v <= 0) {
      // TODO: only warn on dev mode
      console.warn("[pgul] Cannot set 0 or lower number as List size");
      return;
    }
    this._limitSize = v;
  }

  /**
   * 配列から無作為に選ぶ
   *
   * @param random 無指定の場合はインスタンスごとの内部Randomモジュール使用
   */
  randomPick(random?: Random) {
    if (!random) {
      if (!this._random) this._random = new Random();
      random = this._random;
    }
    const i = random.randInt(0, this.lastIndex);
    return this._list[i];
  }

  /**
   * 内部Randomモジュールのシード値を設定
   *
   * @param seed
   */
  setRandomSeed(seed: number) {
    if (!this._random) this._random = new Random();
    this._random.seed = seed;
  }

  /***
   * リストの中身をクリア
   */
  clear() {
    this._list.length = 0;
  }

  /**
   * 現在の内部インデックス値
   */
  get currentIndex() {
    return this._pointerIndex;
  }

  /**
   * 現在の内部インデックス値に対応する要素を返す
   */
  get current() {
    return this._list[this._pointerIndex];
  }

  /**
   * Array.lengthと一緒
   */
  get length() {
    return this._list.length;
  }

  /**
   * 内部インデックス最大値（≒List内の全要素数）
   */
  get lastIndex() {
    return this._list.length - 1;
  }

  /**
   * List内最後の要素を返す
   */
  get last() {
    return this._list[this.lastIndex];
  }

  // range(max) {
  //   // todo
  // }
}

// // Built-in Arrayをextendするパターン: es5ではサポートされていないのでうまく動かない？
// export const ArrayEx = class extends Array {
//   constructor(items) {
//     super(...items);
//   }

//   lastIndex () {
//     return this.length - 1;
//   }
// }
