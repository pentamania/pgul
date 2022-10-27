import {
  KEY_DOWN_FLG_NUM,
  KEY_UP_FLG_NUM,
  toggleKeyStateFrame,
  updateStateFrame,
} from "./common";
import { KbCode } from "./KbCode";
import { Keyboard } from "./Keyboard";

/**
 * keyDown/keyUp処理などの状態による
 * updateKeyStateによる状態の更新が毎フレーム必要
 *
 * @example
 * // TODO
 */
export class StatedKeyboard extends Keyboard {
  /** <キー => 押下フレーム数> のMap */
  private _stateMap: Map<KbCode, number> = new Map();

  /**
   * keyMap側で指定キーコードを定義する.
   * （定義されていないと{@link updateKeyStates}での処理対象とならない）
   *
   * ユーザーキー操作でも動的に定義されるが、それを待たずに設定したい場合に使用する
   *
   * @param codes
   */
  initializeKeyMap(...codes: KbCode[]) {
    codes.forEach((code) => {
      this.keyMap[code] = false;
      this._stateMap.set(code, 0); // 念のため
    });
  }

  /**
   * keyState更新
   * 基本的に毎フレーム実行
   *
   * @param autoPlayMode
   * See {@link updateStateFrame}
   */
  public updateKeyStates(autoPlayMode = false) {
    Object.entries(this.keyMap).forEach(([key, pressed]) => {
      if (!this._stateMap.has(key as KbCode))
        this._stateMap.set(key as KbCode, 0);
      updateStateFrame(this._stateMap, key as KbCode, pressed, autoPlayMode);
    });
  }

  /**
   * 内部キー状態を変更
   * See {@link toggleKeyStateFrame}
   *
   * @param key
   */
  public toggleKeyState(key: KbCode) {
    toggleKeyStateFrame(this._stateMap, key);
  }

  /**
   * <キー => 押下フレーム数>Mapを0/undefinedリセット
   */
  public resetStateMap() {
    Object.entries(this.keyMap).forEach(([key, _pressed]) => {
      this._stateMap.set(key as KbCode, 0);
    });
  }

  public getKeyPress(key: KbCode, threshold = 0): boolean {
    const v = this._stateMap.get(key);
    return v != null && v > threshold;
  }

  public getKeyDown(key: KbCode, border: number = KEY_DOWN_FLG_NUM): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === border;
  }

  public getKeyUp(key: KbCode): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === KEY_UP_FLG_NUM;
  }
}
