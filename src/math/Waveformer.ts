import { PI2 } from "./radianConverter";

const DEFAULT_FREQ = 100;

export type WaveType = "sin" | "cos" | "tan" | "sine";

/**
 * 波形を描くような
 *
 * 基本はラジアン、msec単位で管理
 */
export class Waveformer {
  /** 時間（msec） */
  private _time = 0;

  /**
   * 周波数: 1secに波がいくつあるか[w/sec]
   *
   * 時間と相互関係にあるため、調整の際はtimeとfrequencyどちらかを固定すること
   */
  private _frequency!: number;

  /**
   * 周期：一つの波を描くまでの時間（msec）[ms/w]
   * 周波数とともに更新されるため、直接触らない
   */
  private _period!: number;

  /**
   * 内部正規化ラジアン値:
   * 直接セットはせず、他のプロパティから算出
   */
  private _normalizedWaveRadian = 0;

  /** 基本（最大）振幅 */
  public baseAmplitude: number = 1;

  /**
   * @param frequency
   * @param initAngle
   */
  constructor(frequency: number = DEFAULT_FREQ, initAngle?: number) {
    this.setFrequency(frequency);
    if (initAngle != null) this.setTimeByAngle(initAngle);
  }

  /** 内部パラメータ更新 */
  protected updateParam() {
    const wavePeriod = this._period;

    // 0 ~ 1.0に正規化ラジアン
    const rate = (this._time % wavePeriod) / wavePeriod;
    this._normalizedWaveRadian = PI2 * rate;
  }

  getMagnitude(waveType: WaveType = "cos") {
    switch (waveType) {
      // case "triangle":
      //   return Math.sin(this._normalizedWaveRadian) * this.baseAmplitude;

      case "sin":
      case "sine":
        return Math.sin(this._normalizedWaveRadian) * this.baseAmplitude;

      case "cos":
        return Math.cos(this._normalizedWaveRadian) * this.baseAmplitude;

      case "tan":
        return Math.tan(this._normalizedWaveRadian) * this.baseAmplitude;

      default:
        return Math.sin(this._normalizedWaveRadian) * this.baseAmplitude;
    }
  }

  setFrequency(v: number) {
    // 一応0除算避け？
    if (v === 0) return;

    this._frequency = v;

    // 周期更新
    this._period = 1000 / this._frequency;

    this.updateParam();
    return this;
  }

  setTime(t: number) {
    this._time = t;
    this.updateParam();
    return this;
  }

  setTimeByAngle(rad: number) {
    // 単位時間
    const radToMS = this._period / PI2;
    this.setTime(radToMS * rad);
  }

  getRadian() {
    return this._normalizedWaveRadian;
  }

  /**
   * Temp:
   * @param rad 角度ラジアン
   * @param freq 周波数
   * @returns Time
   */
  static calcTimeByAngle(rad: number, freq: number) {
    const radToMS = 1000 / freq / PI2;
    return radToMS * rad;
  }

  get time() {
    return this._time;
  }
  set time(v) {
    this.setTime(v);
  }
}
