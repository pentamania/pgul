type Evaluator = (obj: any) => boolean;

const defaultEvaluator: Evaluator = (obj: any) => {
  return obj ? obj.parent == null : false;
};

/**
 * 配列拡張でプーリング機能
 */
export class Pool<T = any> {
  private _pool: T[] = [];
  private _commonEvaluator: Evaluator = defaultEvaluator.bind(null);

  /**
   * プーリングする
   *
   * @returns プール後の配列長（length）
   */
  push(...arg: T[]) {
    return this._pool.push(...arg);
  }

  /**
   * プールから使える状態のオブジェクトを取り出す
   * 見つからなければundefinedを返す
   *
   * @param evaluator
   * オブジェクトが使える状態か確認するための関数
   * 指定の無い場合は共通Evaluatorを使う
   */
  pick(evaluator?: Evaluator): T | undefined {
    const isObjAvailable = evaluator ? evaluator : this._commonEvaluator;
    return this._pool.find((obj) => isObjAvailable(obj));
  }

  /**
   * Index指定でプールからオブジェクトを取り出す
   * 見つからなければundefinedを返す
   *
   * @param index
   * @param evaluator
   * オブジェクトが使える状態か確認するための関数
   * 指定の無い場合は共通Evaluatorを使う
   */
  pickByIndex(index: number, evaluator?: Evaluator): T | undefined {
    const isObjAvailable = evaluator ? evaluator : this._commonEvaluator;

    let item: T | undefined = this._pool[index];
    if (item) {
      item = isObjAvailable(item) ? item : undefined;
    }

    return item;
  }

  /**
   * helper関数
   * コールバックでオブジェクトを指定回数分取得、プールに追加する
   *
   * @param num Pooling object number (== Pooing callback execution count)
   * @param cb Callback func returning object to pool
   */
  fill(num: number, cb: (i: number, filledNum: number) => T) {
    for (let i = 0; i < num; i++) {
      const item = cb(i, num);
      this._pool.push(item);
    }
  }

  clearPool() {
    this._pool.length = 0;
  }

  /**
   * オブジェクトが使える状態か評価するための共通関数をセット
   *
   * @param func
   */
  setCommonEvaluator(func: Evaluator) {
    this._commonEvaluator = func;
  }

  /**
   * オブジェクトが使える状態か評価するための関数をクローンして返す
   *
   * デフォルトではオブジェクトにparentプロパティが存在するかで確認する
   *
   * @param func
   */
  get commonEvaluator() {
    return this._commonEvaluator.bind(null);
  }

  /**
   * Number of objects pooled
   */
  get pooledNum() {
    return this._pool.length;
  }
}
