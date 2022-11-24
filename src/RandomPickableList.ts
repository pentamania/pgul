import { List } from "./core/List";
import { Random } from "./math/Random";

/**
 * 配列をゲーム向けに使いやすくするためのクラス
 */
export class RandomPickableList<T = any> extends List<T> {
  protected _random?: Random;

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
}
