import { flipRadianVertical } from "../../../math/radianConverter";
import { RunnerAction } from "../../Runner";
import { createVectorTurnToAction } from "./turning";

/**
 * [en]
 * TODO
 *
 * [jp]
 * 蛇行するようにvectorを変化させるアクションを生成
 * あくまでvector値を変化させるだけのため、
 * 位置反映の処理は別に設定する
 *
 * @param startAngleDegree 開始方向（度数）
 * @param speed runner速度
 * @param turningInterval 方向転換間隔
 * @param turningDuration 方向転換完了までのフレーム数
 * @param actionDuration アクション全体持続フレーム
 */
export function createSnakingVectorAction(
  startAngleDegree: number = 135,
  speed: number = 2,
  turningInterval: number = 90,
  turningDuration: number = 45,
  actionDuration = Infinity
): RunnerAction {
  return function* () {
    let _currentFrameCount = 0;

    // Init vector, speed
    this.setDirection(startAngleDegree);
    this.setSpeed(speed);

    while (_currentFrameCount < actionDuration) {
      if (
        0 < _currentFrameCount &&
        _currentFrameCount % turningInterval === 0
      ) {
        const currentDirectionRadian = this.vectorAngle;

        // Y軸反転角度ラジアン値を計算
        let _nextTargetRadian = flipRadianVertical(
          currentDirectionRadian,
          true
        );

        // アクション内アクション(AiA)：方向転換アクション実行
        const turningActionGen = createVectorTurnToAction(
          _nextTargetRadian,
          turningDuration
        ).bind(this)();
        yield* (function* () {
          while (
            // AiA中もカウント進め、限界値付近になったら処理中止
            _currentFrameCount < actionDuration - 1 &&
            !turningActionGen.next().done
          ) {
            yield _currentFrameCount++;
          }
        })();
      }

      yield _currentFrameCount++;
    }
  };
}
