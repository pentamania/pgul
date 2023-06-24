import { Pool } from "./Pool";
import { GConstructor } from "../core/utilTypes";

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
 *   declare static pick: () => Actor;
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
    /**
     * [jp]
     * 使える状態にあるかどうかのデフォルトフラグ
     */
    isPoolPickable: boolean = true;

    /**
     * [jp]
     * インスタンスをプールからpick後に実行する初期化処理
     * 必要に応じてオーバーライド
     *
     * @virtual
     * デフォルトでは`isPoolPickable`をfalseにする（=使用中状態にする）処理を実行
     */
    resetParam(..._args: any): any {
      this.isPoolPickable = false;
    }

    /**
     * [jp]
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
     * [jp]
     * プールからインスタンスを引き出す
     *
     * 足りない場合は都度instance化して補充、
     * 必ずインスタンスを返す
     *
     * クラスに`resetParam`が定義されている場合は返却前に実行される
     * pickに渡された引数はそのままresetParamにも渡される
     *
     * @returns Instance of Mixin-ed class
     */
    static pick(..._args: any): PoolableClass {
      let instance = _pool.pick(this.checkAvailable);
      if (!instance) {
        instance = new this();
        _pool.push(instance);
      }
      if (instance.resetParam) instance.resetParam(..._args);

      return instance;
    }

    /**
     * インスタンスを生成してプールする
     */
    static pool() {
      _pool.push(new this());
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

    /**
     * プール数
     */
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
