// import { Random } from "./Random";

/**
 * 配列をゲーム向けに使いやすくするためのクラス
 * WIP
 */
export class List<T = any> {
  private _list: T[];
  private _index = 0;
  // private _random: any;

  constructor(...items: any) {
    this._list = items;
  }

  push() {
    return this._list.push(...arguments);
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

  // setRandomSeed(seed: number) {
  //   this._random = new Random(seed);
  // }

  // pickup(seed: number) {
  //   if (!this._random) this._random = new Random(seed);
  //   const i = this._random.randInt(0, this.lastIndex);
  //   // console.log("inde :", i);
  //   return this._list[i];
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
