import mean from "../math/mean";

/**
 * FPS Recorder:
 * Use to record FPS intervals & detect slowdowns
 *
 */
export class FpsRecorder {
  private _fps: number = 0;
  private _recordedCountSum: number = 0;
  private _slowdownDetectedCount: number = 0;
  private readonly _fpsLog: number[] = [];
  private _stepFrameTime: number = 0;
  // private _tolerationRangeFactor = 1.1

  /**
   * 許容フレーム間経過秒数:これを超えたら処理落ちしたとみなす
   * (FPS60で約0.0183sec)
   */
  private _toleratedFrameIntervalSec: number = 0.0183;

  /**
   * @param fps
   * See {@link setFps}
   * @param toleration
   * See {@link setFps}
   */
  constructor(fps = 60, toleration = 1.1) {
    this.setFps(fps, toleration);
    this.resetLogs();
  }

  /**
   * @param fps Base param of this mod
   * @param toleration [default=1.1]
   * toleratedFrameIntervalSec = 1 / fps * 1.1
   */
  public setFps(fps: number, toleration: number) {
    this._fps = fps;
    this._stepFrameTime = 1 / fps;
    this._toleratedFrameIntervalSec = this._stepFrameTime * toleration;
  }

  public resetLogs() {
    this._fpsLog.length = 0;
    this._recordedCountSum = 0;
    this._slowdownDetectedCount = 0;
  }

  /**
   * FPS平均値を算出、その後ログを消去
   *
   * @returns FPS平均値
   */
  public flushFpsLog(): number {
    const m = mean(this._fpsLog);
    this._fpsLog.length = 0;
    return m;
  }

  /**
   * FPS関係、処理落ちの検知を記録
   * 基本的に毎フレーム実行
   *
   * @param frameDeltaSec フレーム間経過sec
   * @returns 処理落ちを検出したらtrueを返す
   */
  public recordFps(frameDeltaSec: number): boolean {
    // 0除算回避（まずあり得ない？）
    if (frameDeltaSec === 0) frameDeltaSec = this._stepFrameTime;

    this._fpsLog.push(1 / frameDeltaSec);
    this._recordedCountSum++;

    // 処理落ち記録
    if (frameDeltaSec >= this._toleratedFrameIntervalSec) {
      // Log("処理落ち", frameDeltaMS);
      this._slowdownDetectedCount++;
      return true;
    }
    return false;
  }

  /**
   * Helper
   * 処理落ち率を計算
   *
   * (処理落ち回数 / 総記録回数) * 100[%]
   */
  public calcFpsSlowdownPercentage() {
    return (
      FpsRecorder.calcSlowdownRatio(
        this._recordedCountSum,
        this._slowdownDetectedCount
      ) * 100
    );
  }

  get fps() {
    return this._fps;
  }

  get toleratedFrameIntervalSec() {
    return this._toleratedFrameIntervalSec;
  }

  /**
   * Returns cloned array of fps logs
   */
  get logs(): number[] {
    return this._fpsLog.slice(0);
  }

  get logCount(): number {
    return this._fpsLog.length;
  }

  static calcSlowdownRatio(
    totalRecordCount: number,
    slowdownDetectedCount: number
  ) {
    return slowdownDetectedCount / totalRecordCount;
  }
}
