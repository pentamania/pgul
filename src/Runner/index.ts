import { Coroutine } from "../Coroutine";
import { Vector2 } from "../Vector2";
import { CoroutineAction } from "../interfaces";
import { toDegree, toRadian } from "../utils/radianConverter";

/**
 * this参照をRunnerとしたGeneratorFunction型
 */
export type RunnerAction = CoroutineAction<Runner>;

/**
 * Runner
 * Corutionの機能を使って対象物のパラメータ（主にx,y値）を変化させるためのクラス
 */
export class Runner<T = any> extends Coroutine {
  private _speed: number = 1;
  /**
   * vector方向計算用の内部ラジアン値
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
   * // 指定durationかけて指定Xへ移動するアクション（thisはRunnerを指す）
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
   * vectorをセット
   * @param x
   * @param y
   */
  setVector(x: number | undefined, y: number | undefined) {
    this.vector.set(x, y);
    // 内部ラジアン値も変更
    this._vectorRadian = this.vector.getAngleByRadian();
    return this;
  }

  /**
   * 度数単位で現在のvector方向を取得
   */
  getDirection() {
    // return this.vector.getAngleByDegree();
    return toDegree(this._vectorRadian);
  }

  getDirectionByRadian() {
    // return this.vector.getAngleByRadian();
    return this._vectorRadian;
  }

  /**
   * 進行方向を変える（度数単位）
   * @param degree 度数単位
   */
  setDirection(degree: number) {
    return this.setDirectionByRadian(toRadian(degree));
  }

  /**
   * 進行方向を変える（ラジアン値）
   * @param radian
   */
  setDirectionByRadian(radian: number) {
    this._vectorRadian = radian;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
    return this;
  }

  /**
   * vector方向回転
   * @param args
   */
  rotateVector(angleRadian: number) {
    this._vectorRadian += angleRadian;
    this.vector.setFromRadian(this._vectorRadian, this._speed);
  }
  // rotateVector(...args: Parameters<typeof Vector2.prototype.rotate>) {
  //   this.vector.rotate(...args);
  //   this._vectorRadian = this.vector.getAngleByRadian();
  // }

  /**
   * 速度をセット。内部的にはvector長をセットします。
   * @param speed
   */
  setSpeed(speed: number) {
    // 値が極端に小さいときは0補正（でないと変な方向を向いていることにされる）
    this._speed = speed < 0.00000001 ? 0 : speed;
    // this.vector.normalize().mul(this._speed);
    this.vector.setFromRadian(this._vectorRadian, this._speed);
    return this;
  }

  /**
   * vectorのクローンオブジェクトを返す
   */
  getVector() {
    return this.vector.clone();
  }

  get speed() {
    return this._speed;
  }

  get vx(): number {
    return this.vector.x;
  }

  get vy(): number {
    return this.vector.y;
  }

  /**
   * vectorの向きをラジアン値で返す
   */
  get vectorAngle() {
    return this._vectorRadian;
  }

  static registerAction(name: string, gen: CoroutineAction) {
    Runner.actionDictionary.set(name, gen);
  }

  static actionDictionary: Map<string, RunnerAction> = new Map();
}

export * from "./defaultActions";
