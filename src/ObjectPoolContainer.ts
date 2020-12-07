type ReadyChecker = (obj: any) => boolean;

/**
 * @class
 */
export class ObjectPoolContainer<T = any> {
  private _pools: Map<string, T[]> = new Map();
  private _objReadyChecker: ReadyChecker = (obj: any | undefined) =>
    obj ? obj.parent == null : false;

  setPool(key: string) {
    if (this._pools.has(key)) return this;

    const pool: T[] = [];
    this._pools.set(key, pool);
    return pool;
  }

  getPool(key: string) {
    return this._pools.get(key);
  }

  /**
   * プーリングする
   */
  pool(key: string, obj: T) {
    if (!this._pools.has(key)) this.setPool(key);
    const pool = this._pools.get(key);
    if (!pool) {
      // TODO warn
      return
    }
    pool.push(obj);
  }

  // fill(key, $class, args:[], num) {
  // }

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
      return undefined
    }
    if (index != null) {
      // return pool[index];
      const item = pool[index];
      return this._objReadyChecker(item) ? item : undefined;
    }
    return pool.find((obj) => this._objReadyChecker(obj));
  }

  /**
   * オブジェクトが準備できているか確認するための関数をセット
   * デフォルトではオブジェクトにparentがセットされているかどうかで確認
   * @param func
   */
  setReadyChecker(func: ReadyChecker) {
    this._objReadyChecker = func;
  }
}
