import { List } from "../core/List";
import { Random } from "../math/Random";
import shuffleArray from "../utils/shuffleArray";

/**
 * [en]
 * Add randomizing features to List class
 *
 * [jp]
 * Listクラスにランダム関係の機能追加
 */
export class RandomPickableList<T = any> extends List<T> {
  protected _random?: Random;

  /**
   * [jp] 無作為に選ぶ
   *
   * @param random
   * [jp] 無指定の場合はインスタンスごとの内部Randomモジュール使用
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
   * [jp] 内部Randomモジュールのシード値を設定
   *
   * @param seed
   */
  setRandomSeed(seed: number) {
    if (!this._random) this._random = new Random();
    this._random.seed = seed;
  }

  /**
   * [jp] 内部配列の要素インデックスをシャッフルする
   *
   */
  shuffle(rng?: Random) {
    if (!rng) {
      if (!this._random) this._random = new Random();
      rng = this._random;
    }
    return shuffleArray(this._list, rng.random.bind(rng));
  }
}
