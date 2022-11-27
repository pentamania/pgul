import { RunnerAction, TargetDeclaredRunnerAction } from "../../Runner2D";
import { LooseVector2 } from "../../../core/utilTypes";

/**
 * forwardingActionを生成して返す
 *
 * @param duration 持続フレーム
 * @param directionDeg 方向（度数単位） 同時設定用
 * @param speed 速度 同時設定用
 * @returns
 */
export function createForwardingAction(
  duration: number = Infinity,
  directionDeg?: number,
  speed?: number
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    let _currentCount = 0;

    if (directionDeg != null) this.setDirection(directionDeg);
    if (speed != null) this.setSpeed(speed);

    while (_currentCount < duration) {
      this.target.x += this.vx;
      this.target.y += this.vy;
      yield _currentCount++;
    }
  };
}

/**
 * シンプルにvector方向に沿って進むRunnerAction
 *
 * @param duration
 */
export const forwardingAction: RunnerAction<LooseVector2> = function* (
  duration: number = Infinity
) {
  let _cnt = 0;
  while (_cnt < duration) {
    if (this.target) {
      this.target.x += this.vx;
      this.target.y += this.vy;
    }
    yield _cnt++;
  }
};

// export const forwardingAction: RunnerAction<LooseVector2> = function(duration: number) {
//   return createForwardingAction()
// }
