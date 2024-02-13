const DEFAULT_BPM = 60;

/**
 * @see https://runstant.com/pentamania/projects/f8d4707b
 * @param bpm
 * @returns
 */
const _bpmToUnitMS = function (bpm: number) {
  return (1 / (bpm / 60)) * 1000;
};

/**
 * 拍を管理
 * 音楽BPMに応じたエフェクトをかけるときに利用する
 */
export class BeatCounter {
  /** 経過時間積算 単位[ms] */
  private _timeSum = 0;
  private _bpm;
  private _unitTimeCache;
  private _beatCount = 0;

  constructor(bpm = DEFAULT_BPM) {
    this._bpm = bpm;
    this._unitTimeCache = _bpmToUnitMS(bpm);
  }

  /** @virtual コールバック */
  onBeat: (beatCount: number) => any = () => {};

  /**
   * 時間進める：ビートする条件を満たしたらコールバック実行
   * 毎フレーム実行
   * @param deltaTime
   */
  tick(deltaTime: number) {
    this._timeSum += deltaTime;
    if (this._unitTimeCache < this._timeSum) {
      this._beatCount++;
      this.onBeat(this._beatCount);
      this._timeSum = 0;
    }
  }

  resetCount() {
    this._beatCount = 0;
  }

  get bpm() {
    return this._bpm;
  }
  set bpm(v: number) {
    this._bpm = v;
    this._unitTimeCache = _bpmToUnitMS(v);
  }

  get beatCount() {
    return this._beatCount;
  }
}
