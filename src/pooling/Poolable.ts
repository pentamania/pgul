import { Pool } from "./Pool";
import { GConstructor } from "../core/utilTypes";

/**
 * [en] Mixin which adds object-pooling feature
 *
 * [jp] オブジェクトプーリング機能を付与するmixin
 *
 * @example
 * // Pre-defined Base class
 * // class DisplayObject {
 * //   removeFromParent() { code }
 * // }
 *
 * class Actor extends Poolable(DisplayObject) {
 *   life: number = 0;
 *   removeFromParent() {
 *     this.isPoolPickable = true;
 *     return super.removeFromParent();
 *   }
 *   resetParam() {
 *     this.life = 100;
 *     this.isPoolPickable = false
 *   }
 *   // Re-declare returning object type
 *   declare static pick: () => Actor;
 * }
 *
 * // Newly created
 * const actor = Actor.pick();
 * actor.life = 200;
 *
 * // Back to pool
 * actor.remove()
 *
 * // Picked from pool, not newly created
 * const actor2 = Actor.pick();
 *
 * // Should props be reset
 * console.log(actor2.life); // 100
 *
 * @param Base
 */
export function Poolable<TBase extends GConstructor>(
  Base: TBase
  // prePooledNum?: number
) {
  // 使う時になるまで無とする
  let _pool: Pool<PoolableClass> | undefined;

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
     */
    resetParam?(..._args: any): any;
    // Warning: Do Not define default func to aviod unexpected overriding
    // resetParam(..._args: any): any {
    //   this.isPoolPickable = false;
    // }

    /**
     * [jp]
     * 使用可能（プールからpick可能）かどうか判定
     *
     * @virtual
     * デフォルトでは{@link isPoolPickable}フラグで判定
     * 必要に応じてオーバーライド
     *
     * @param obj
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
      if (!_pool) _pool = new Pool<PoolableClass>();

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
      if (!_pool) _pool = new Pool<PoolableClass>();
      _pool.push(new this());
    }

    static createInstance() {
      return new this();
    }

    /**
     * Empty pool
     */
    static clearPool() {
      _pool?.clearPool();
    }

    /**
     * プール参照を得る
     */
    static getPoolArray() {
      if (!_pool) _pool = new Pool<PoolableClass>();
      return _pool.array;
    }

    /**
     * プール数を得る
     */
    static get pooledNum() {
      return _pool?.pooledNum;
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
