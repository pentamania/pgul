import { Random } from "./Random";

/**
 * 配列をゲーム向けに使いやすくするためのクラス
 */
export class List<T = any> {
  protected _list: T[];
  protected _index = 0;
  protected _random?: Random;
  protected _limitSize?: number;

  constructor(...items: T[]) {
    this._list = items;
  }

  /**
   * 通常はArray.pushと同じだが、
   * サイズが設定されている場合、サイズ超過時に頭の要素が押し出されて返却される
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

  pop() {
    return this._list.pop();
  }

  getList() {
    return this._list.slice(0);
  }

  /**
   * 内部インデックスを設定しつつ、対応するオブジェクトを返す
   * 範囲外のインデックス値はセットできず、undefinedを返す
   * @param i
   */
  setIndex(i: number) {
    if (i < 0 || this.lastIndex < i) {
      // TODO：デバッグビルド時にエラー出す
      return undefined;
    }
    this._index = i;
    return this._list[this._index];
  }

  /**
   * 内部インデックスを進めながら、対応するオブジェクトを返す
   * @param loop インデックスをオーバーしたときループするかどうか。falseの場合、オーバーしそうになると最大インデックスで固定
   */
  increment(loop = true) {
    let nextIndex = this._index + 1;
    if (this.lastIndex < nextIndex) {
      nextIndex = loop ? 0 : this.lastIndex;
    }
    return this.setIndex(nextIndex);
  }

  /**
   * 内部インデックスを減じながら、対応するオブジェクトを返す  。
   * @param loop インデックスをオーバーしたときループするかどうか。falseの場合、オーバーしそうになると0で固定
   */
  decrement(loop = true) {
    let nextIndex = this._index - 1;
    if (nextIndex < 0) {
      nextIndex = loop ? this.lastIndex : 0;
    }
    return this.setIndex(nextIndex);
  }

  /**
   * リスト容量を取得（未設定のときはundefined）
   */
  getSize(): number | undefined {
    return this._limitSize;
  }

  /**
   * リストの容量を設定する
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
   * @param random 無指定の場合はインスタンスごとの内部random使う
   */
  randomPick(random?: Random) {
    if (!random) {
      if (!this._random) this._random = new Random();
      random = this._random;
    }
    const i = random.randInt(0, this.lastIndex);
    return this._list[i];
  }

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
    return this._index;
  }

  /**
   * 現在の内部インデックス値に対応するオブジェクトを返す
   */
  get current() {
    return this._list[this._index];
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
   * List内最後の要素
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
