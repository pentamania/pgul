import { Coroutine } from "../Coroutine";
import { Vector2 } from "../Vector2";
import { toDegree, toRadian } from "../utils/radianConverter";
import { ContextBindableGeneratorFunction } from "../utilTypes";

/**
 * this参照をRunnerとしたGeneratorFunction型
 * Genericsでtargetプロパティの型を指定可能
 */
export type RunnerAction<RT = any> = ContextBindableGeneratorFunction<
  Runner<RT>
>;

/**
 * Runner
 * Corutionの機能を使って対象物のパラメータ（主にx,y値）を変化させるためのクラス
 *
 * @example
 * const point = {x: 0, y: 0};
 * const runner = new Runner(point);
 * // pointパラメータを1/60秒毎にx, yそれぞれ2ずつ加算する
 * // それを120ステップ行う
 * runner.setVector(2, 2);
 * runner.addAction(function* progressAction() {
 *   let count = 0;
 *   while (count < 120) {
 *     this.target.x += this.vx;
 *     this.target.y += this.vy;
 *     yield count++;
 *   }
 * });
 * function loop() {
 *  const res = runner.step();
 *  if (res) requestAnimationFrame(loop);
 * }
 * loop();
 *
 * @description
 * ### vectorについて
 * Runnerは対象物をコントロールするための2次元Vectorを内部に保持する
 * これにより速度や進行方向を操作することが可能
 *
 * #### vector値の読み書き
 * - 読み取りはgetVector, vx/vy getter
 * - 変更はsetVector, vx/vy setter
 *
 * などを使い、直接のVector書き換えはやらないこと
 *
 * vector長の大きさはsetSpeed、
 * 方向はsetDirection等
 * でも操作可能
 *
 */
export class Runner<T = any> extends Coroutine {
  /** 速度値（内部的にはvector長） */
  private _speed: number = 1;

  /**
   * vector用の内部ラジアン値
   * 基本的にはこの値をベースにvectorパラメータを更新する
   */
  private _vectorRadian: number = 0;

  /**
   * vectorプロパティは保護されてます。
   * 取得する場合は`getVector`メソッドを使用のこと
   */
  protected vector: Readonly<Vector2> = new Vector2(0, 0);

  /**
   * Runner対象オブジェクト
   */
  target?: T;

  /**
   * @param target
   */
  constructor(target?: T) {
    super();
    if (target) this.setTarget(target);
  }

  /**
   * @param target
   */
  setTarget(target: T) {
    this.target = target;
    return this;
  }

  /**
   * Adds RunnerAction
   *
   * @example
   * const runner = new Runner();
   *
   * // Sample action (this: Runner)
   * const gotoAction = function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * };
   *
   * // 1. simple pattern
   * runner.addAction(gotoAction, 200, 120);
   *
   * // 2. createAction pattern
   * function createGotoAction(x, duration) {
   *   return function() {
   *     return gotoAction.bind(this)(x, duration)
   *   }
   * }
   * // alternative: 直接引数を埋め込んだRunnerActionを返す
   * function createGotoActionDirect(x, duration) {
   *   return function*() {
   *     let count = 0;
   *     const progressUnit = (x - this.target.x) / duration;
   *     while (count < duration) {
   *       this.target.x += progressUnit;
   *       yield count++;
   *     }
   *   }
   * }
   * runner.addAction(createGotoAction(200, 120));
   * runner.addAction(createGotoActionDirect(200, 120));
   *
   * // 3. Set with iife
   * runner.addAction(
   *   (()=> {
   *     const x = 200;
   *     const duration = 120;
   *     return function*() {
   *       let count = 0;
   *       const progressUnit = (x - this.target.x) / duration;
   *       while (count < duration) {
   *         this.target.x += progressUnit;
   *         yield count++;
   *       }
   *     }
   *   })()
   * );
   *
   * @param action GeneratorFunctionでthisをRunnerにしたもの、文字列指定で予め登録したAction実行可能？
   * @param args 可変長でRunnerAction実行時の引数パラメータを設定（文字列指定で有効、それ以外は使いずらいかも？）
   */
  addAction(action: RunnerAction, ...args: any): this {
    return this.addTask({
      action,
      args: args,
    });
  }

  /**
   * [en]
   * Add action with pre-registered action name
   *
   * [jp]
   * 予め登録したアクション名でアクションを追加
   *
   * @example
   * Runner.registerAction("goto", function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * });
   *
   * // Load action
   * const runner = new Runner();
   * runner.addActionByName("goto", 200, 120);
   *
   * @param actionName
   * @param args args for runnerAction
   * @returns
   */
  addActionByName(actionName: string, ...args: any): this {
    const actGenfunc = Runner.actionDictionary.get(actionName);
    if (actGenfunc) {
      this.addAction(actGenfunc, ...args);
    } else {
      // Not found
      console.error(`"${actionName}"というアクションはありません`);
    }
    return this;
  }

  /**
   * vectorパラメータをセット
   *
   * 内部ラジアン値及びスピード値も同時に変更される
   *
   * @param x 無指定の場合はそのまま
   * @param y 無指定の場合はそのまま
   */
  setVector(x?: number, y?: number) {
    // 例外的に一旦vectorを直接操作 -> 内部ラジアン値更新
    this.vector.set(x, y);
    this._vectorRadian = this.vector.getAngleByRadian();
    this._speed = this.vector.length;
    return this;
  }

  /**
   * 度数単位で現在の進行方向（vector方向）を取得
   */
  getDirection() {
    // 注：vectorから直接計算しないこと
    // return this.vector.getAngleByDegree();
    return toDegree(this._vectorRadian);
  }

  /**
   * ラジアン単位で現在の進行方向（vector方向）を取得
   */
  getDirectionByRadian() {
    // 注：vectorから直接計算しないこと
    // return this.vector.getAngleByRadian();
    return this._vectorRadian;
  }

  /**
   * 進行方向（vector方向）をセット（ラジアン単位）
   * @alias {@link setDirectionByRadian}
   *
   * @param radian
   */
  setVectorAngle(radian: number) {
    this._vectorRadian = radian;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
    return this;
  }

  /**
   * 進行方向（vector方向）をセット（度数単位）
   * @param degree 度数単位
   */
  setDirection(degree: number, speed?: number) {
    if (speed != null) this.setSpeed(speed);
    return this.setVectorAngle(toRadian(degree));
  }

  /**
   * 進行方向（vector方向）をセット（ラジアン単位）
   * @alias {@link setVectorAngle}
   *
   * @param radian
   */
  setDirectionByRadian(radian: number) {
    return this.setVectorAngle(radian);
  }

  /**
   * 進行方向（vector）を回転
   * @param addedAngleRadian
   */
  rotateVector(addedAngleRadian: number) {
    this._vectorRadian += addedAngleRadian;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
  }

  /**
   * 速度をセット（内部的にはvector長をセット）
   * @param speed
   */
  setSpeed(speed: number) {
    // // normalizeを使った方法：値が極端に小さいときは0補正が必要
    // // でないと変な方向を向いていることにされる
    // this._speed = speed < 0.00000001 ? 0 : speed;
    // this.vector.normalize().mul(this._speed);

    this._speed = speed;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
    return this;
  }

  /**
   * vectorのクローンオブジェクトを返す
   */
  getVector() {
    return this.vector.clone();
  }

  /**
   * 速度（vector長）
   */
  get speed() {
    return this._speed;
  }

  /**
   * x軸進行方向（vector.x）
   */
  get vx(): number {
    return this.vector.x;
  }
  set vx(v: number) {
    this.setVector(v);
  }

  /**
   * y軸進行方向（vector.y）
   */
  get vy(): number {
    return this.vector.y;
  }
  set vy(v: number) {
    this.setVector(undefined, v);
  }

  /**
   * vectorの向きをラジアン値で返す
   */
  get vectorAngle() {
    return this._vectorRadian;
  }

  static registerAction(name: string, gen: ContextBindableGeneratorFunction) {
    Runner.actionDictionary.set(name, gen);
  }

  static actionDictionary: Map<string, RunnerAction> = new Map();
}

/**
 * targetプロパティが確定したRunner
 */
export class TargetDeclaredRunner<T = any> extends Runner<T> {
  declare target: T;
}

/**
 * this参照を`TargetDeclaredRunner`としたGeneratorFunctionもどき型
 */
export type TargetDeclaredRunnerAction<
  T = any
> = ContextBindableGeneratorFunction<TargetDeclaredRunner<T>>;
