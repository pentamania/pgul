import { LooseVector2 } from "../../../math/Vec2Like";
import { Waveformer } from "../../../math/Waveformer";
import { BaseRunnerAction } from "../../BaseRunner";

export function createFixedOrbitingAction(
  centerVec: LooseVector2,
  waveStartAngle: number,
  orbitRadius: number,
  orbitFreqency: number,
  duration: number = Infinity
): BaseRunnerAction<LooseVector2> {
  return function* () {
    // Local vars
    let _cnt = 0;
    const waver = new Waveformer(orbitFreqency, waveStartAngle);

    // 初期化
    waver.baseAmplitude = orbitRadius;

    while (_cnt < duration) {
      // waver更新
      waver.time++;

      // 本体位置反映
      if (this.target) {
        this.target.x = centerVec.x + waver.getMagnitude("cos");
        this.target.y = centerVec.y + waver.getMagnitude("sin");
      }

      yield _cnt++;
    }
  };
}
