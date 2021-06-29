import { Pool } from "../Pool";
import { GConstructor } from "./common";

/**
 * オブジェクトプーリング機能を付与する
 *
 * @example
 * class Actor extends Poolable(class {}) {
 *   name: string = "";
 *   remove() { this.isPoolPickable = true }
 *   resetParam() {
 *     this.name = "John Doe"
 *     this.isPoolPickable = false
 *   }
 *   static pick: () => Actor;
 * }
 *
 * // Newly created
 * const actor = Actor.pick();
 * actor.name = "pentamania";
 *
 * // Back to pool
 * actor.remove()
 *
 * // Picked from pool, not newly created
 * const actor2 = Actor.pick();
 *
 * // Should be reset
 * console.log(actor2.name); // "John Doe"
 *
 * @param Base
 */
export function Poolable<TBase extends GConstructor>(
  Base: TBase
  // prePooledNum?: number
) {
  const _pool = new Pool<PoolableClass>();

  class PoolableClass extends Base {
    /** 使える状態にあるかどうかのデフォルトフラグ */
    isPoolPickable: boolean = true;

    /**
     * プールからpick後に実行する初期化処理
     * 必要に応じて定義する
     *
     * @virtual
     */
    resetParam?(..._args: any): any;

    /**
     * 使用可能（プールからpick可能）かどうか判定
     * 必要に応じてオーバーライド
     *
     * @param obj
     * @returns
     */
    static checkAvailable(obj: any): boolean {
      return (obj as PoolableClass).isPoolPickable;
    }

    /**
     * プールから引き出す
     * 足りない場合は都度instance化して補充され、
     * 必ずインスタンスを返す
     *
     * @returns Instance of Mixin-ed class
     */
    static pick(..._args: any) {
      let instance = _pool.pick(this.checkAvailable);
      if (!instance) {
        instance = new this();
        _pool.push(instance);
      }
      if (instance.resetParam) instance.resetParam(..._args);

      return instance;
    }

    static createInstance() {
      return new this();
    }

    /**
     * Empty pool
     */
    static clearPool() {
      _pool.clearPool();
    }

    static get pooledNum() {
      return _pool.pooledNum;
    }
  }

  // // Not working...
  // if (prePooledNum) {
  //   for (let i = 0; i < prePooledNum; i++) {
  //     _pool.push(new PoolableClass());
  //   }
  // }

  return PoolableClass;
}
