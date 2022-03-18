import { RunnerAction } from "../../Runner";

/**
 *
 * @param type Sets how to handle 2nd-arg angle
 * @param angleRadian Angle to set
 *  "to": Absolute, "by": Relative
 * @param duration
 */
export function createVectorTurningAction(
  type: "to" | "by",
  angleRadian: number,
  duration: number
): RunnerAction {
  return function* () {
    let _currentCount = 0;
    const delta =
      type === "to" ? angleRadian - this.getDirectionByRadian() : angleRadian;
    const unit = delta / duration;
    while (_currentCount < duration) {
      this.rotateVector(unit);
      yield _currentCount++;
    }
  };
}

/**
 *
 * @param targetAngleRadian
 * @param duration
 */
export function createVectorTurnToAction(
  targetAngleRadian: number,
  duration: number
): RunnerAction {
  return createVectorTurningAction("to", targetAngleRadian, duration);
}

/**
 *
 * @param turningAngleRadian
 * @param duration
 */
export function createVectorTurnByAction(
  turningAngleRadian: number,
  duration: number
): RunnerAction {
  return createVectorTurningAction("by", turningAngleRadian, duration);
}

/**
 * Turn vector angle every step
 *
 * @param stepAngleRadian
 * @param duration
 */
export function createVectorStepTurningAction(
  stepAngleRadian: number,
  duration: number
): RunnerAction {
  return function* () {
    let _currentCount = 0;
    while (_currentCount < duration) {
      this.rotateVector(stepAngleRadian);
      yield _currentCount++;
    }
  };
}
