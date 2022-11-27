import { toRadian } from "../../../math/radianConverter";
import { RunnerAction } from "../../Runner2D";
import { createVectorTurnToAction } from "./turning";

const defaultDegreeList = [45, 135];
const defaultSwitchInterval = 60;

/**
 * [en]
 * Create action varing vector to zig-zag
 *
 * [jp]
 * ジグザグするようvector値を更新するアクションを生成
 * 速度(speed値)は元々指定されてた値を利用する
 *
 * @param directionDegreeList 移動方向リスト
 * @param directionSwitchInterval 移動方向切り替えの間隔
 * @param directionTurningDuration
 * 方向転換時に旋回アクションを行いたいときに指定
 * 未指定のときは即座に転回
 * @param duration
 */
export function createZigzagVectorAction(
  directionDegreeList: number[] = defaultDegreeList,
  directionSwitchInterval: number = defaultSwitchInterval,
  directionTurningDuration?: number,
  duration: number = Infinity
): RunnerAction {
  return function* () {
    let _currentCount = 0;
    let _dirIndex = 0;
    let _speedRestored = this.speed;

    // Set starting vector
    this.setDirection(directionDegreeList[_dirIndex]);

    let _turningActionGen: Generator | null = null;

    while (_currentCount < duration) {
      if (_turningActionGen) {
        // 旋回処理勧める
        // この間、親アクション進行は保留状態とする
        yield* _turningActionGen;
        _turningActionGen = null;
        this.setSpeed(_speedRestored);
      } else {
        // 方向転換
        if (_currentCount % directionSwitchInterval === 0) {
          // 方向リストindexリセット
          if (directionDegreeList.length <= ++_dirIndex) _dirIndex = 0;

          // 転換
          const nextAngleDeg = directionDegreeList[_dirIndex];
          if (directionTurningDuration) {
            // 停止してその場旋回処理はじめ
            _speedRestored = this.speed;
            this.setSpeed(0);
            _turningActionGen = createVectorTurnToAction(
              toRadian(nextAngleDeg),
              directionTurningDuration
            ).bind(this)();
            _turningActionGen.next(); // 初回処理
          } else {
            // 即座に方向転換
            this.setDirection(nextAngleDeg);
          }
        }

        yield _currentCount++;
      }
    }
  };
}
