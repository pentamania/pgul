import { KEY_DOWN_FLG_NUM, KEY_UP_FLG_NUM } from "./common";
import { getGamepad, getStickY, getStickX } from "./gamepadHelpers";

const DEFAULT_DEFAULT_STICK_TILT_THRESHOLD = 0.3;

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

  /** Map<gpbuttonIndex, framePressCount> */
  private _stateMap: Map<number, number> = new Map();

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
   * buttonsのState更新
   * 基本的に毎フレーム実行
   */
  public updateButtonStates() {
    getGamepad(this._gpIndex)?.buttons.forEach((btn, i) => {
      const lastVal = this._stateMap.get(i)!;
      if (btn.pressed) {
        if (lastVal === KEY_UP_FLG_NUM) {
          // keyUp -> keyDown状態へ
          this._stateMap.set(i, KEY_DOWN_FLG_NUM);
        } else {
          // keypress加算
          this._stateMap.set(i, lastVal + 1);
        }
      } else {
        if (0 < lastVal) {
          // keyDown/Press -> KeyUp状態へ
          this._stateMap.set(i, KEY_UP_FLG_NUM);
        } else {
          // ニュートラルへ
          this._stateMap.set(i, 0);
        }
      }
    });
  }

  // Buttons
  getButtonPress(buttonId: number, threshold = 0): boolean {
    const v = this._stateMap.get(buttonId);
    return v != null && v > threshold;
  }

  getButtonDown(buttonId: number): boolean {
    const v = this._stateMap.get(buttonId);
    return v != null && v === KEY_DOWN_FLG_NUM;
  }

  getButtonUp(buttonId: number): boolean {
    const v = this._stateMap.get(buttonId);
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

  // Direction buttons?

  /** 未実装 Not implemented */
  getUpButtonPress(): boolean {
    return false;
  }
  /** 未実装 Not implemented */
  getDownButtonPress(): boolean {
    return false;
  }
  /** 未実装 Not implemented */
  getLeftButtonPress(): boolean {
    return false;
  }
  /** 未実装 Not implemented */
  getRightButtonPress(): boolean {
    return false;
  }

  /**
   * [jp]
   * Gamepadいずれかのボタンの押下検知
   * (同時押ししているときは最もindexの若いボタンのみ)
   *
   * @returns
   * gamepadが無い、あるいは何のボタンを押下してないときは-1を返却
   */
  public findPressedButtonIndex(): number {
    const gp = getGamepad(this._gpIndex);
    if (!gp) return -1;
    return gp.buttons.findIndex((btn) => btn.pressed);
  }
}
