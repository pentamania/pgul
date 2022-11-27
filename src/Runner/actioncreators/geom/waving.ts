import { TargetDeclaredRunnerAction } from "../../Runner2D";
import { LooseVector2 } from "../../../core/utilTypes";
import { Waveformer } from "../../../math/Waveformer";
import { Vector2 } from "../../../math/Vector2";
import { DEG_TO_RAD_TABLE, toRadian } from "../../../math/radianConverter";

/** 1 wave per 60fps */
const defaultFrequency = 1000 / 60;

export interface WaveOption {
  time: number;
  radius: number;
  frequency: number;
  applyHorizontal?: boolean;
  applyVertical?: boolean;
}

/**
 * パラメータオブジェクトを介して細かく挙動を調整可能な波形移動アクション
 *
 * @param waveParamRef パラメータオブジェクト
 * @param duration
 * @returns RunnerAction
 */
export function createConfigurableWaveformingAction(
  waveParamRef: WaveOption,
  duration: number = Infinity
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    // Local vars
    const _centerPos = new Vector2().copyFrom(this.target);
    const _waver = new Waveformer(waveParamRef.frequency);

    while (0 < duration) {
      // パラメータ更新
      _centerPos.x += this.vx;
      _centerPos.y += this.vy;
      _waver.setFrequency(waveParamRef.frequency);
      _waver.baseAmplitude = waveParamRef.radius;
      _waver.time = waveParamRef.time;

      // 本体位置反映
      const _applyH =
        waveParamRef.applyHorizontal != null
          ? waveParamRef.applyHorizontal
          : true;
      const _applyV =
        waveParamRef.applyVertical != null ? waveParamRef.applyVertical : true;
      const waveFactor = _waver.getMagnitude();
      const normAngleRad = this.vectorAngle - DEG_TO_RAD_TABLE[90];
      this.target.x = _applyH
        ? _centerPos.x + Math.cos(normAngleRad) * waveFactor
        : _centerPos.x;
      this.target.y = _applyV
        ? _centerPos.y + Math.sin(normAngleRad) * waveFactor
        : _centerPos.y;

      yield duration--;
    }
  };
}

/**
 * ターゲットを波形移動させるrunnerアクションを生成
 *
 * 波時間は1stepごとに1ms固定で進む
 *
 * サイクル調整はfrequency設定で行う
 * ex) 50step(50ms)で波が1サイクル完了させたいときは freqencyを1000/50 => 20とする
 *
 * @param waveRadius
 * @param waveFreqency
 * @param waveStartAngleDeg
 * @param duration
 * @returns RunnerAction
 */
export function createFixedWaveformingAction(
  waveRadius: number = 1,
  waveFreqency: number = defaultFrequency,
  waveStartAngleDeg: number = 0,
  duration: number = Infinity
): TargetDeclaredRunnerAction<LooseVector2> {
  return function* () {
    // Local vars
    const centerPos = new Vector2().copyFrom(this.target);
    const waver = new Waveformer(waveFreqency, toRadian(waveStartAngleDeg));

    // 初期化
    waver.baseAmplitude = waveRadius;

    while (0 < duration) {
      // パラメータ更新
      waver.time++;
      centerPos.x += this.vx;
      centerPos.y += this.vy;

      // 本体位置反映
      const waveFactor = waver.getMagnitude();
      const normAngleRad = this.vectorAngle - DEG_TO_RAD_TABLE[90];
      this.target.x = centerPos.x + Math.cos(normAngleRad) * waveFactor;
      this.target.y = centerPos.y + Math.sin(normAngleRad) * waveFactor;

      yield duration--;
    }
  };
}
