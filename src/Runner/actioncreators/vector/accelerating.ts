import { Vector2 } from "../../../Vector2";
import { RunnerAction } from "../../Runner";

/**
 * 特定のspeed値に達するまでベクトル値を加算
 *
 * @example
 * const tgt = new RunnerDrivenClass()
 * tgt.setActionRunner(
 *   [
 *     createAccelerateAction(...args),
 *     createForwardingAction(...args)
 *   ]
 * )
 *
 * @param destSpeed 最終速度
 * @param duration
 */
export function createVectorAccelerateAction(
  destSpeed: number,
  duration: number
): RunnerAction {
  return function* () {
    let _currentCount = 0;
    const delta = destSpeed - this.speed;
    const unit = delta / duration;
    while (_currentCount < duration) {
      this.setSpeed(this.speed + unit);
      yield _currentCount++;
    }
  };
}

/**
 * 指定ベクトル方向に重力がかかっているように毎フレームベクトル値加算
 *
 * @param force 重力加算値
 * @param forceDirectionDeg 重力方向（度数単位）
 * @param maxSpeed 最高速度
 * @param duration
 */
export function createGraviticVectorAction(
  force: number = 0.04,
  forceDirectionDeg: number = 90,
  maxSpeed: number = Infinity,
  duration: number = Infinity
): RunnerAction {
  return function* () {
    const forceVector = Vector2.createFromDegree(forceDirectionDeg);

    const fx = forceVector.x * force;
    const fy = forceVector.y * force;
    const maxVX = forceVector.x * maxSpeed;
    const maxVY = forceVector.y * maxSpeed;
    let _currentCount = 0;
    while (_currentCount < duration) {
      this.setVector(
        Math.min(this.vx + fx, maxVX),
        Math.min(this.vy + fy, maxVY)
      );
      yield _currentCount++;
    }
  };
}
