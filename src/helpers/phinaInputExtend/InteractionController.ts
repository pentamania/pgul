import { DEFAULT_DOUBLE_INPUT_DELAY_FRAME, LEFT_STICK_ID } from "./const";
import extendGamePad from "./extendGamePad";
import { App, keyAssignData, KeyCode } from "./types";

type KeyTag = string | number;
type KeyAssignMap<T> = Map<T, keyAssignData>;

// Keyboard & Gamepad common keys
export const UP_KEY_COMMON = "up";
export const DOWN_KEY_COMMON = "down";
export const LEFT_KEY_COMMON = "left";
export const RIGHT_KEY_COMMON = "right";
export type DirectionKey =
  | typeof UP_KEY_COMMON
  | typeof DOWN_KEY_COMMON
  | typeof LEFT_KEY_COMMON
  | typeof RIGHT_KEY_COMMON;

/**
 * phinaのインタラクション処理を統合処理
 *
 * phina.jsのgamepad APIについて
 * @see https://qiita.com/minimo/items/27020fdb66375f1f868b
 *
 */
export class InteractionController<AK extends KeyTag = KeyTag> {
  private _app!: App;
  private _assignMap: KeyAssignMap<AK> = new Map();
  private _doubleKeySuspendCountMap: Map<AK, number> = new Map();
  private _doubleKeyDownAcceptThreshold: number = DEFAULT_DOUBLE_INPUT_DELAY_FRAME;

  setApp(app: App) {
    this._app = app;
    extendGamePad(app);
  }

  /**
   * 二連続keydownを検知できるようにする
   * setApp後であること
   * TODO： 方向キーにも反応させる
   */
  enableDoubleKeyInput() {
    if (!this._app) {
      console.error("appを先にセットする必要があります");
      return;
    }
    // 毎フレーム入力確認
    this._app.on("enterframe", () => {
      // 猶予時間を更新（先にやること）
      this._doubleKeySuspendCountMap.forEach((count, key) => {
        if (count > 0) this._doubleKeySuspendCountMap.set(key, count - 1);
      });

      this._assignMap.forEach((_assignData, key) => {
        // 初期化
        if (!this._doubleKeySuspendCountMap.has(key)) {
          this._doubleKeySuspendCountMap.set(key, 0);
        }

        // 猶予時間リセット
        const keyCount = this._doubleKeySuspendCountMap.get(key)!;
        if (keyCount === 0 && this.keyDown(key)) {
          this._doubleKeySuspendCountMap.set(
            key,
            this._doubleKeyDownAcceptThreshold
          );
        }
      });
    });
  }

  /**
   * キー定義
   *
   * @example
   * controller.defineKey('shot', 'Z', 'B')
   *
   * @param actionKey
   * @param kbKey
   * @param gpKey
   */
  defineKey(actionKey: AK, kbKey: KeyCode, gpKey?: KeyCode): void {
    this._assignMap.set(actionKey, {
      kb: kbKey,
      gp: gpKey,
    });
  }

  /**
   * Apply keyboard/gamepad key to specifed action.
   * Defines new key if specifed key does not exists
   *
   * @param actionKey
   * @param kbKey
   * @param gpKey
   * @returns
   */
  assignKey(actionKey: AK, kbKey: KeyCode, gpKey?: KeyCode): void {
    const keyAssign = this._assignMap.get(actionKey);
    if (!keyAssign) {
      return this.defineKey(actionKey, kbKey, gpKey);
    }
    keyAssign.kb = kbKey;
    keyAssign.gp = gpKey;
  }

  /**
   * キーアサイン状態をJSONオブジェクトにして返す
   */
  toJSON(): { [keyName in KeyTag]: keyAssignData } {
    return Object.fromEntries(this._assignMap);
  }

  /**
   * Return assignData of specifed action
   *
   * @param actionKey
   * @returns
   */
  getKeyAssignData(actionKey: AK): keyAssignData | undefined {
    const aData = this._assignMap.get(actionKey);
    if (!aData) {
      console.warn(`${actionKey} is not defined.`);
      return undefined;
    }
    return aData;
  }

  /**
   * 登録したアクションのキーを押した瞬間
   *
   * @param actionKey
   */
  keyDown(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this.gamepadAvailable &&
      aData.gp &&
      this._app.gamepad!.getKeyDown(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKeyDown(aData.kb) || isGamepadActive;
  }

  /**
   * 二連続keydownを検知
   * enableDoubleKeyInputしてないときはシングル入力扱い
   */
  doubleKeyDown(actionKey: AK): boolean {
    // 猶予時間以内、かつシングル入力時のフレームでないこと
    const sus = this._doubleKeySuspendCountMap.get(actionKey);
    const withinTime =
      sus != null && sus > 0 && sus !== this._doubleKeyDownAcceptThreshold;
    // console.log('sus',sus);

    // 入力検知時は猶予時間リセット
    const isDouble = withinTime && this.keyDown(actionKey);
    if (isDouble) this._doubleKeySuspendCountMap.set(actionKey, 0);
    return isDouble;

    // return withinTime && this.keyDown(actionKey);
  }

  /**
   * 登録したアクションのキーが入力中
   *
   * @param actionKey
   */
  keyPress(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this.gamepadAvailable && aData.gp && this._app.gamepad!.getKey(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKey(aData.kb) || isGamepadActive;
  }

  /**
   * 登録したアクションのキーを上げた瞬間
   *
   * @param actionKey
   */
  keyUp(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;
    const isGamepadActive =
      this.gamepadAvailable && aData.gp && this._app.gamepad!.getKeyUp(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKeyUp(aData.kb) || isGamepadActive;
  }

  /**
   * ↑入力かどうか
   *
   * @example
   * update() {
   *   if (controller.pressUp()) {
   *     this.goUp()
   *   }
   * }
   *
   * @returns 入力中はtrueを返す
   */
  pressUp(): boolean {
    const isGpPressed = (() => {
      if (this.gamepadAvailable) {
        const gpAngle = this._app.gamepad!.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad!.getKey(UP_KEY_COMMON) || gpAngle
          ? gpAngle.y < -this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKey(UP_KEY_COMMON) || isGpPressed;
  }

  /**
   * ↓入力中かどうか
   *
   * @returns 入力中はtrueを返す
   */
  pressDown(): boolean {
    const isGpPressed = (() => {
      if (this.gamepadAvailable) {
        const gpAngle = this._app.gamepad!.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad!.getKey(DOWN_KEY_COMMON) || gpAngle
          ? gpAngle.y > this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKey(DOWN_KEY_COMMON) || isGpPressed;
    // return (kb.getKey('down') || gp.getKey(DOWN_KEY) || gpAngle.y > GAMEPAD_THRESHOLD)
  }

  pressLeft() {
    const isGpPressed = (() => {
      if (this.gamepadAvailable) {
        const gpAngle = this._app.gamepad!.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad!.getKey(LEFT_KEY_COMMON) || gpAngle
          ? gpAngle.x < -this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKey(LEFT_KEY_COMMON) || isGpPressed;
  }

  pressRight() {
    const isGpPressed = (() => {
      if (this.gamepadAvailable) {
        const gpAngle = this._app.gamepad!.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad!.getKey(RIGHT_KEY_COMMON) || gpAngle
          ? gpAngle.x > this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKey(RIGHT_KEY_COMMON) || isGpPressed;
  }

  /**
   * ↑キーのkeydown
   */
  upKeyDown() {
    const isGpKeyDown = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const gpAngle = gp.getStickDirection(LEFT_STICK_ID);
        return gp.getKeyDown(UP_KEY_COMMON) || gpAngle
          ? gp.getStickTilt(LEFT_STICK_ID) &&
              gpAngle.y < -this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyDown(UP_KEY_COMMON) || isGpKeyDown;
  }

  /**
   * 下キーのkeydown
   */
  downKeyDown() {
    const isGpKeyDown = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const gpAngle = gp.getStickDirection(LEFT_STICK_ID);
        return gp.getKeyDown(DOWN_KEY_COMMON) || gpAngle
          ? gp.getStickTilt(LEFT_STICK_ID) &&
              gpAngle.y > this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyDown(DOWN_KEY_COMMON) || isGpKeyDown;
  }

  /**
   * →キーのkeydown
   */
  rightKeyDown() {
    const isGpKeyDown = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const gpAngle = gp.getStickDirection(LEFT_STICK_ID);
        return gp.getKeyDown(RIGHT_KEY_COMMON) || gpAngle
          ? gp.getStickTilt(LEFT_STICK_ID) &&
              gpAngle.x > this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyDown(RIGHT_KEY_COMMON) || isGpKeyDown;
  }

  /**
   * ←キーのkeydown
   */
  leftKeyDown() {
    const isGpKeyDown = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const gpAngle = gp.getStickDirection(LEFT_STICK_ID);
        return gp.getKeyDown(LEFT_KEY_COMMON) || gpAngle
          ? gp.getStickTilt(LEFT_STICK_ID) &&
              gpAngle.x < -this.gamepadStickThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyDown(LEFT_KEY_COMMON) || isGpKeyDown;
  }

  /**
   * ゲームパッドのスティックを傾けたとする範囲
   */
  get gamepadStickThreshold() {
    if (!this._app.gamepad) return 0;
    return this._app.gamepad.stickDeadZoneThreshold;
  }
  set gamepadStickThreshold(v: number) {
    if (!this._app.gamepad) return;
    this._app.gamepad.stickDeadZoneThreshold = v;
  }

  /**
   * キー2回入力の猶予時間
   */
  set doubleKeyDownAcceptThreshold(v: number) {
    this._doubleKeyDownAcceptThreshold = v;
  }

  /**
   * ゲームパッドが使用可能かどうか
   */
  get gamepadAvailable(): boolean {
    return this._app.gamepad != null && !this._app.gamepad.isLocked;
  }

  get keyboard() {
    return this._app.keyboard;
  }

  get gamepad() {
    return this._app.gamepad;
  }
}
