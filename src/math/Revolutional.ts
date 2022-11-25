import { clamp } from "../utils";
import {
  TwoDimensionalObject,
  TwoDimensionalObjectConstructor,
} from "../core/utilTypes";
import { toRadian } from "./radianConverter";

// Params
const DEFAULT_REVOLUTION_VELOCITY_THRESHOLD = toRadian(2);

/**
 * 公転軌道を描くような動作を行うための機能を付与するMixin
 * 別名Orbital
 *
 * @param Base
 */
export function Revolutional<TBase extends TwoDimensionalObjectConstructor>(
  Base: TBase
) {
  return class extends Base {
    /**
     * 位置計算のベースとなる回転角度（ラジアン単位）
     * ex) 回転半径をRとすると、_rotationalAngle = 0のときは x= R, y=0
     */
    _revolutionAngle: number = 0;

    /** 公転の中心 */
    revolutionCenter?: TwoDimensionalObject = {
      x: 0,
      y: 0,
    };

    /** 角速度（公転速度）:ラジアン単位 */
    revolutionAngularVelocity: number = 0;

    /**
     * 角加速度：1tickごとの角速度加算値（ラジアン単位）
     * -> [rad/tick]
     */
    revolutionAngularAccelaration: number = 0;

    /** 公転速度の最高値 */
    revolutionMaxAngularVelocity: number = Infinity;

    /** 公転半径 */
    revolutionRadius: number = 0;

    /** 遠心力：公転半径の乗算される値 */
    revolutionCentrifugalForce: number = 1;

    /** 公転半径の最大値 */
    maxRevolutionRadius: number = Infinity;

    /** 回転しているとみなす角速度値 */
    isRevolutingThresholdVelocity: number = DEFAULT_REVOLUTION_VELOCITY_THRESHOLD;

    /**
     * 公転速度に加速度を加算
     */
    tickRevolutionVelocity() {
      const max = this.revolutionMaxAngularVelocity;
      this.revolutionAngularVelocity = clamp(
        this.revolutionAngularVelocity + this.revolutionAngularAccelaration,
        -max,
        max
      );
    }

    /**
     * 角度に公転速度を加算
     */
    tickRevolutionAngle() {
      this._revolutionAngle += this.revolutionAngularVelocity;
    }

    /**
     * 公転半径に遠心力を乗算
     */
    tickRevolutionRadius() {
      this.revolutionRadius = Math.min(
        this.revolutionRadius * this.revolutionCentrifugalForce,
        this.maxRevolutionRadius
      );
    }

    /**
     * 全ての公転パラメータを更新
     */
    tickRevolution() {
      this.tickRevolutionRadius();
      this.tickRevolutionVelocity();
      this.tickRevolutionAngle();
    }

    /**
     * 角度・半径パラメータを位置に反映
     */
    applyRevolution() {
      if (!this.revolutionCenter) return;
      const center = this.revolutionCenter;
      this.x =
        center.x + Math.cos(this._revolutionAngle) * this.revolutionRadius;
      this.y =
        center.y + Math.sin(this._revolutionAngle) * this.revolutionRadius;
    }

    /**
     * 公転運動パラメータ全て進めて位置を反映する
     */
    updateRevolution() {
      this.tickRevolution();
      this.applyRevolution();
    }

    /**
     * 公転角度をラジアン指定（≒位置を設定）
     * @param radian
     */
    setRevolutionAngle(radian: number, resetVelocity: boolean = true) {
      if (resetVelocity) this.revolutionAngularVelocity = 0;
      this._revolutionAngle = radian;
    }

    /**
     * 公転角度を度数指定（≒位置を設定）
     * @param degAngle
     */
    setRevolutionAngleByDegree(degAngle: number) {
      return this.setRevolutionAngle(toRadian(degAngle));
    }

    /**
     * 角速度値がしきい値をこえているかどうか
     */
    isRotating() {
      return (
        Math.abs(this.revolutionAngularVelocity) >
        this.isRevolutingThresholdVelocity
      );
    }

    get revolutionAngle() {
      return this._revolutionAngle;
    }
  };
}
