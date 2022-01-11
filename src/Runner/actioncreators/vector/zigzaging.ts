import { RunnerAction } from "../../Runner";

const defaultDegreeList = [45, 135];
const defaultSwitchInterval = 60;

/**
 * [en]
 * Create action varing vector to zig-zag
 *
 * [jp]
 * ジグザグするようvector値を更新するアクションを生成
 *
 * @param directionDegreeList 移動方向リスト
 * @param directionSwitchInterval 移動方向切り替えの間隔
 * @param duration
 */
export function createZigzagVectorAction(
  directionDegreeList: number[] = defaultDegreeList,
  directionSwitchInterval: number = defaultSwitchInterval,
  duration: number = Infinity
): RunnerAction {
  return function* () {
    let _currentCount = 0;
    let _dirIndex = 0;

    // Set starting vector
    this.setDirection(directionDegreeList[_dirIndex]);

    while (_currentCount < duration) {
      if (_currentCount % directionSwitchInterval === 0) {
        if (directionDegreeList.length <= ++_dirIndex) _dirIndex = 0;
        this.setDirection(directionDegreeList[_dirIndex]);
      }
      yield _currentCount++;
    }
  };
}
