import {
  KEY_DOWN_FLG_NUM,
  KEY_UP_FLG_NUM,
  toggleKeyStateFrame,
  updateStateFrame,
} from "./common";
import {
  Direction,
  DirectionKeys,
  D_DOWN,
  D_LEFT,
  D_RIGHT,
  D_UP,
} from "./Directions";
import { getGamepad, getStickY, getStickX } from "./gamepadHelpers";

const DEFAULT_DEFAULT_STICK_TILT_THRESHOLD = 0.3;
export type GpButtonId = number;

export type GpCodeAll = Direction | GpButtonId;

/**
 * Gamepad機能強化ラッパー
 *
 * 設定indexのGamepadが取得できなかった場合、どの入力判定もfalseとなる
 */
export class GamepadExtension {
  /** gamepad index cache: 無い場合、毎回つながっているGamePadを探しに行く */
  private _gpIndex?: number;

  /** スティック傾き処理におけるデフォルト値 */
  defaultStickTiltThreshold: number = DEFAULT_DEFAULT_STICK_TILT_THRESHOLD;

  /** Map<gpbuttonIndex|DirectionKey, framePressCount> */
  private _stateMap: Map<GpCodeAll, number> = new Map([
    [D_UP, 0],
    [D_DOWN, 0],
    [D_LEFT, 0],
    [D_RIGHT, 0],
  ]);

  constructor(gpIndex?: number) {
    this.initialize(gpIndex);
  }

  /**
   * 初期化
   *
   * @param gpIndex
   * @param cacheIndex Cache the gamepad index [default:true]
   * @returns
   * 初期化に失敗したらfalseを返す
   */
  public initialize(gpIndex?: number, cacheIndex: boolean = true): boolean {
    const gp = getGamepad(gpIndex);
    if (!gp) {
      if (gpIndex != null) {
        console.error(`[pgul]: Gamepad:${gpIndex} is not connected!`);
      } else {
        console.error(`[pgul]: No Gamepad connection found!`);
      }
      return false;
    }

    if (cacheIndex) this._gpIndex = gp.index;
    this._initButtonStates(gp);
    return true;
  }

  private _initButtonStates(gamepad: Gamepad) {
    gamepad.buttons.forEach((_btn, i) => this._stateMap.set(i, 0));
  }

  resetStateMap() {
    this._stateMap.forEach((_v, k) => {
      this._stateMap.set(k, 0);
    });
  }

  /**
   * 全ての入力処理用Stateを更新
   * 基本的に毎フレーム実行
   *
   * @param autoPlayMode
   */
  public updateStates(autoPlayMode?: boolean) {
    this.updateButtonStates(autoPlayMode);
    this.updateDirectionStates(autoPlayMode);
  }

  /**
   * buttonsのState更新
   * 基本的に毎フレーム実行
   *
   * @param autoPlayMode
   * See {@link updateStateFrame}
   */
  public updateButtonStates(autoPlayMode = false) {
    getGamepad(this._gpIndex)?.buttons.forEach((btn, i) => {
      if (!this._stateMap.has(i)) this._stateMap.set(i, 0);
      updateStateFrame(this._stateMap, i, btn.pressed, autoPlayMode);
    });
  }

  /**
   * 方向処理追加
   * 基本的に毎フレーム実行
   *
   * @param autoPlayMode
   * See {@link updateStateFrame}
   */
  public updateDirectionStates(autoPlayMode = false) {
    DirectionKeys.forEach((dir) => {
      let pressed = false;
      switch (dir) {
        case "up":
          pressed = this.getStickUp() || this.getUpButtonPress();
          break;
        case "down":
          pressed = this.getStickDown() || this.getDownButtonPress();
          break;
        case "left":
          pressed = this.getStickLeft() || this.getLeftButtonPress();
          break;
        case "right":
          pressed = this.getStickRight() || this.getRightButtonPress();
          break;
      }
      updateStateFrame(this._stateMap, dir, pressed, autoPlayMode);
    });
  }

  /**
   * 内部キー状態を変更
   * See {@link toggleKeyStateFrame}
   *
   * @param buttonId
   */
  public toggleButtonState(buttonId: GpCodeAll) {
    toggleKeyStateFrame(this._stateMap, buttonId);
  }

  // Buttons
  getButtonPress(key: GpCodeAll, threshold = 0): boolean {
    const v = this._stateMap.get(key);
    return v != null && v > threshold;
  }

  getButtonDown(key: GpCodeAll, border: number = KEY_DOWN_FLG_NUM): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === border;
  }

  getButtonUp(key: GpCodeAll): boolean {
    const v = this._stateMap.get(key);
    return v != null && v === KEY_UP_FLG_NUM;
  }

  // Sticks
  getStickUp(tiltThreshold: number = this.defaultStickTiltThreshold): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && getStickY(gp) < -tiltThreshold;
  }

  getStickDown(
    tiltThreshold: number = this.defaultStickTiltThreshold
  ): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && tiltThreshold < getStickY(gp);
  }

  getStickLeft(
    tiltThreshold: number = this.defaultStickTiltThreshold
  ): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && getStickX(gp) < -tiltThreshold;
  }

  getStickRight(
    tiltThreshold: number = this.defaultStickTiltThreshold
  ): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && tiltThreshold < getStickX(gp);
  }

  // Direction buttons
  public dPadUpId: number = DpadLayoutMap["default"].DPAD_UP;
  public dPadDownId: number = DpadLayoutMap["default"].DPAD_DOWN;
  public dPadLeftId: number = DpadLayoutMap["default"].DPAD_LEFT;
  public dPadRightId: number = DpadLayoutMap["default"].DPAD_RIGHT;

  /** Is Up button pressed */
  getUpButtonPress(): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && gp.buttons[this.dPadUpId]?.pressed === true;
  }

  /** Is Down button pressed */
  getDownButtonPress(): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && gp.buttons[this.dPadDownId]?.pressed === true;
  }

  /** Is Left button pressed */
  getLeftButtonPress(): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && gp.buttons[this.dPadLeftId]?.pressed === true;
  }

  /** Is Right button pressed */
  getRightButtonPress(): boolean {
    const gp = getGamepad(this._gpIndex);
    return gp != null && gp.buttons[this.dPadRightId]?.pressed === true;
  }

  /**
   * Gamepadいずれかのボタンのkeydown検知
   * (同時押ししているときは最もindexの若いボタンのみ)
   *
   * @returns
   * 見つかったGamepadId or undefined
   */
  public getAnyButtonDown(): GpButtonId | undefined {
    let btnId: GpButtonId | undefined;
    getGamepad(this._gpIndex)?.buttons.some((_btn, id) => {
      if (this.getButtonDown(id)) {
        btnId = id;
        return true;
      }
      return false;
    });
    return btnId;
  }
}

// Ref: https://github.com/samiare/Controller.js/tree/master/source/layouts
const DpadLayoutMap = {
  // Xbox Controllers
  default: {
    DPAD_UP: 11,
    DPAD_DOWN: 12,
    DPAD_LEFT: 13,
    DPAD_RIGHT: 14,
  },
  // label temporary
  ps: {
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15,
  },
};
