import { Vector2 } from "../../../math/Vector2";
import { RunnerAction } from "../../index";

/**
 * Create inner-vector setting Action
 *
 * @param directionDegree
 * @param speed
 */
export function createVectorSettingAction(
  directionDegree?: number,
  speed?: number
): RunnerAction {
  return function* () {
    if (directionDegree != null) this.setDirection(directionDegree);
    if (speed != null) this.setSpeed(speed);
  };
}

/**
 * Create inner-vector setting action by copying other vector
 *
 * @param vec
 */
export function createVectorCopyingAction(vec: Vector2): RunnerAction {
  return function* () {
    this.setVector(vec.x, vec.y);
  };
}
