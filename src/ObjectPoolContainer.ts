type ReadyChecker = (obj: any) => boolean;
type ObjectResetter = (obj: any) => void;

/**
 * @class
 */
export class ObjectPoolContainer<KT = string, T = any> {
  private _pools: Map<KT, T[]> = new Map();
  private _objReadyChecker: ReadyChecker = (obj: any | undefined) =>
    obj ? obj.parent == null : false;
  private _objectResetter?: ObjectResetter;

  setPool(key: KT) {
    if (this._pools.has(key)) return this;

    const pool: T[] = [];
    this._pools.set(key, pool);
    return pool;
  }

  getPool(key: KT) {
    return this._pools.get(key);
  }

  /**
   * プーリングする
   */
  pool(key: KT, obj: T) {
    if (!this._pools.has(key)) this.setPool(key);
    const pool = this._pools.get(key);
    if (!pool) {
      // TODO warn
      return;
    }
    pool.push(obj);
  }

  /**
   * オブジェクトを指定回数分取得、プール追加する
   * @param poolKey
   * @param objectFillNum
   * @param objectGetFunc
   */
  fill(
    poolKey: KT,
    objectFillNum: number,
    objectGetFunc: (i?: number, n?: number) => T
  ) {
    if (!this._pools.has(poolKey)) this.setPool(poolKey);
    const pool = this._pools.get(poolKey)!;
    for (let i = 0; i < objectFillNum; i++) {
      const item = objectGetFunc(i);
      if (!item) {
        // Callback should return something
        return;
      }
      pool.push(item);
    }
  }

  /**
   * 同期的にプールからオブジェクトを取り出す
   * 見つからなければundefinedを返す
   *
   * @param key プール取得キー
   * @param index [optional ]添字を指定した場合、その中身が存在＆準備できてれば、それを返す
   */
  pick(key: string, index?: number): T | undefined {
    const pool = this._pools.get(key);
    if (!pool) {
      // TODO warn
      return undefined;
    }
    let item: T | undefined;
    if (index != null) {
      // return pool[index];
      item = pool[index];
      item = this._objReadyChecker(item) ? item : undefined;
    }
    item = pool.find((obj) => this._objReadyChecker(obj));
    if (item && this._objectResetter) {
      this._objectResetter(item);
    }
    return item;
  }

  /**
   * オブジェクトが準備できているか確認するための関数をセット
   * デフォルトではオブジェクトにparentがセットされているかどうかで確認
   * @param func
   */
  setReadyChecker(func: ReadyChecker) {
    this._objReadyChecker = func;
  }

  setObjectResetter(func: ObjectResetter) {
    this._objectResetter = func;
  }
}
