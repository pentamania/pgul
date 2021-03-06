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
  protected vector: Readonly<Vector2> = new Vector2(1, 0);

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
   * Coroutine.addTaskのラッパー
   *
   * @example
   * const runner = new Runner();
   *
   * // サンプルアクション：指定durationかけて指定Xへ移動する（thisはRunnerを指す）
   * const gotoAction = function* (x, duration) {
   *   let count = 0;
   *   const progressUnit = (x - this.target.x) / duration;
   *   while (count < duration) {
   *     this.target.x += progressUnit;
   *     yield count++;
   *   }
   * };
   *
   * // 1. シンプルパターン：
   * runner.addAction(gotoAction, 200, 120);
   *
   * // 2. createActionパターン：引数埋め込みでアクションを設定したいときにおすすめ
   * function createGotoAction(x, duration) {
   *   return function() {
   *     return gotoAction.bind(this)(x, duration)
   *   }
   * }
   * // もしくは直接引数を埋め込んだRunnerActionを返す
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
   * // 3. iifeパターン：createActionパターンの変形、場合によっては有効
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
   * // 4. アクション文字列＋引数指定パターン：引数が何なのか忘れるとつらい、正直イマイチかも
   * Runner.registerAction("goto", gotoAction);
   * runner.addAction("goto", 200, 120);
   *
   * @param action GeneratorFunctionでthisをRunnerにしたもの、文字列指定で予め登録したAction実行可能？
   * @param args 可変長でRunnerAction実行時の引数パラメータを設定（文字列指定で有効、それ以外は使いずらいかも？）
   */
  addAction(action: string | RunnerAction, ...args: any): this {
    const genFunc =
      typeof action === "string" ? Runner.actionDictionary.get(action) : action;
    if (genFunc) {
      this.addTask({
        action: genFunc,
        args: args,
      });
    } else {
      // errror
      console.error(`"${action}"というアクションはありません`);
    }
    return this;
  }

  /**
   * vectorパラメータをセット
   * @param x 無指定の場合はそのまま
   * @param y 無指定の場合はそのまま
   */
  setVector(x?: number, y?: number) {
    // 例外的に一旦vectorを直接操作 -> 内部ラジアン値更新
    this.vector.set(x, y);
    this._vectorRadian = this.vector.getAngleByRadian();
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
   * 進行方向（vector方向）をセット（度数単位）
   * @param degree 度数単位
   */
  setDirection(degree: number) {
    return this.setDirectionByRadian(toRadian(degree));
  }

  /**
   * 進行方向（vector方向）をセット（ラジアン値）
   * @param radian
   */
  setDirectionByRadian(radian: number) {
    this._vectorRadian = radian;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
    return this;
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
