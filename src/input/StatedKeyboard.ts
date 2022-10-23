import { KEY_DOWN_FLG_NUM, KEY_UP_FLG_NUM } from "./common";
import { KbCode, Keyboard } from "./Keyboard";

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

  public updateKeyStates() {
    Object.entries(this.keyMap).forEach(([key, pressed]) => {
      const k = key as KbCode;
      const lastVal = this._stateMap.get(k);
      if (pressed) {
        if (lastVal === KEY_UP_FLG_NUM) {
          // keyUp -> keyDown状態へ
          this._stateMap.set(k, KEY_DOWN_FLG_NUM);
        } else {
          // keypress加算
          this._stateMap.set(k, (lastVal || 0) + 1);
        }
      } else {
        if (lastVal != null && 0 < lastVal) {
          // keyDown/Press -> KeyUp状態へ
          this._stateMap.set(k, KEY_UP_FLG_NUM);
        } else {
          // ニュートラルへ
          this._stateMap.set(k, 0);
        }
      }
    });
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

  public getKeyDown(key: KbCode): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === KEY_DOWN_FLG_NUM;
  }

  public getKeyUp(key: KbCode): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === KEY_UP_FLG_NUM;
  }
}
