import { toRadian } from "../../../index";
import { LooseVector2 } from "../../../utilTypes";
import { Waveformer } from "../../../math/Waveformer";
import { TargetDeclaredRunnerAction } from "../../Runner";

export function createFixedOrbitingAction(
  centerVec: LooseVector2,
  waveStartAngle: number,
  orbitRadius: number,
  orbitFreqency: number,
  duration: number = Infinity
): TargetDeclaredRunnerAction<LooseVector2> {
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
      this.target.x = centerVec.x + waver.getMagnitude("cos");
      this.target.y = centerVec.y + waver.getMagnitude("sin");

      yield _cnt++;
    }
  };
}
