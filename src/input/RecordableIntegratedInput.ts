import { Direction } from "./Directions";
import { ActionLabelDefault, IntegratedInput } from "./IntegratedInput";

/**
 * [frame, keyId]
 */
export type RecordedKeyLog = [number, number];

/**
 * IntegratedInputにキー入力を保存＆再生する機能を追加
 */
export class RecordableIntegratedInput<
  AL extends ActionLabelDefault = ActionLabelDefault
> extends IntegratedInput<AL> {
  private _recordedKeyInputLog: RecordedKeyLog[] = [];

  public automaticPlay = false;

  /**
   * @override automaticPlayプロパティをデフォルト値とする
   */
  public updateKeyStates(autoPlayMode: boolean = this.automaticPlay) {
    super.updateKeyStates(autoPlayMode);
  }

  /**
   * 変化した入力を記録する
   * 基本毎フレーム処理
   *
   * @param actionsToRecord 保存したい入力の配列
   * (WIP)KeyIdがどのアクションに対応するかはこの順番による
   *
   * @param frame フレーム値
   */
  public recordInput(actionsToRecord: (AL | Direction)[], frame: number) {
    actionsToRecord.forEach((key, keyId) => {
      if (this.getKeyDown(key) || this.getKeyUp(key)) {
        // console.log("recordInput", key, keyId);
        this._recordedKeyInputLog.push([frame, keyId]);
      }
    });
  }

  /**
   * 記録したキー入力情報を破棄
   * @param actionsToRecord
   */
  resetRecordedInput(actionsToRecord: (AL | Direction)[]) {
    this._recordedKeyInputLog.length = 0;

    // 初期状態を0フレーム目の入力として記録
    actionsToRecord.forEach((action, keyId) => {
      if (this.getKeyPress(action)) {
        this._recordedKeyInputLog.push([0, keyId]);
      }
    });
  }

  /**
   * 複製したキー入力記録ログの配列を返す
   */
  public getRecordedKeyInputLog() {
    return this._recordedKeyInputLog.slice(0);
  }

  /**
   * 内部キー状態を切り替え
   * キーボード側のみ処理（kb gp両方でやるとややこしい）
   *
   * See {@link toggleKeyStateFrame}
   */
  public toggleKeyState(actionLabel: AL | Direction) {
    const ad = this.getKeyAssignData(actionLabel);
    if (!ad) return;
    // console.log("toggleKeyState", actionLabel, ad);

    this.keyboard.toggleKeyState(ad.kb!);
    // this.gamepad.toggleButtonState(ad.gp!);
  }
}
