import { Random } from "./Random";

/**
 * 配列をゲーム向けに使いやすくするためのクラス
 * WIP
 */
export class List<T = any> {
  protected _list: T[];
  protected _index = 0;
  protected _random?: Random;

  constructor(...items: any) {
    this._list = items;
  }

  push(...arg: T[]) {
    return this._list.push(...arg);
  }

  pop() {
    return this._list.pop();
  }

  getList() {
    return this._list.slice(0);
  }

  increment() {
    return this._list[++this._index];
  }

  decrement() {
    return this._list[--this._index];
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

  get current() {
    return this._list[this._index];
  }

  get length() {
    return this._list.length;
  }

  get lastIndex() {
    return this._list.length - 1;
  }

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
