import { DEFAULT_DOUBLE_INPUT_DELAY_FRAME, LEFT_STICK_ID } from "./const";
import extendGamePad from "./extendGamePad";
import { App, GAMEPAD_BUTTON_CODES, KeyAssignData, KeyCode } from "./types";

type KeyTag = string | number;
type KeyAssignMap<T> = Map<T, KeyAssignData>;
export type RecordedKeyLog = [number, number]; // [frame, keyId]

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
export const DIRECTION_KEYS = [
  UP_KEY_COMMON,
  DOWN_KEY_COMMON,
  LEFT_KEY_COMMON,
  RIGHT_KEY_COMMON,
] as const;
/** keyUp判定に使う数値： 負数なら何でもよい */
const KEY_UP_FLG_NUM = -1;

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

  /** キーラベル=> 押下フレーム数 のMap */
  protected _keyStateMap: Map<AK | DirectionKey, number> = new Map([
    ["up", 0],
    ["down", 0],
    ["right", 0],
    ["left", 0],
  ]);

  /** 入力キー切替のログ */
  public readonly recordedKeyInputLog: RecordedKeyLog[] = [];

  /**
   * 自動操作状態
   * 具体的には{@link InteractionController.updateKeyState}の振る舞いを変える
   */
  public automaticPlay: boolean = false;

  /**
   * キーの入力状態に応じてその押下フレーム時間を更新orリセット
   *
   * デフォルトの入力状態チェックは{@link InteractionController.keyPress}に依存するため、
   * keyPressの結果に関わる元のphina keyboard/gameappの状態が先に更新されている必要がある
   *
   * 自動プレイ状態状態では
   * - keyUp状態 -> キー離した状態にリセット
   * - keyPress/Down状態 -> 押下継続
   * - 押してない状態 -> 何もしない
   * を行う
   */
  public updateKeyState() {
    if (this.automaticPlay) {
      // 自動プレイ状態
      this._keyStateMap.forEach((curVal, key) => {
        if (curVal === KEY_UP_FLG_NUM) {
          // keyUp状態 -> デフォルト状態に
          this._keyStateMap.set(key, 0);
        } else if (curVal > 0) {
          // keyPress/Down状態 -> 押下状態つづける
          this._keyStateMap.set(key, curVal + 1);
        }
      });
    } else {
      this._keyStateMap.forEach((curVal, key) => {
        if (this.keyPressRaw(key)) {
          const val = curVal === KEY_UP_FLG_NUM ? 1 : curVal + 1;
          this._keyStateMap.set(key, val);
        } else {
          const val = curVal > 0 ? KEY_UP_FLG_NUM : 0;
          this._keyStateMap.set(key, val);
        }
      });
    }
  }

  /**
   * キー状態リセット
   */
  public resetKeyState() {
    this._keyStateMap.forEach((_val, key) => {
      this._keyStateMap.set(key, 0);
    });
  }

  public setApp(app: App) {
    this._app = app;
    extendGamePad(app);
  }

  /**
   * 二連続keydownを検知できるようにする
   * setApp後であること
   * TODO： 方向キーにも反応させる
   */
  public enableDoubleKeyInput() {
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
  public defineKey(actionKey: AK, kbKey: KeyCode, gpKey?: KeyCode): void {
    this._assignMap.set(actionKey, {
      kb: kbKey,
      gp: gpKey,
    });
    this._keyStateMap.set(actionKey, 0);
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
  public assignKey(actionKey: AK, kbKey: KeyCode, gpKey?: KeyCode): void {
    const keyAssign = this._assignMap.get(actionKey);
    if (!keyAssign) {
      return this.defineKey(actionKey, kbKey, gpKey);
    }
    keyAssign.kb = kbKey;
    keyAssign.gp = gpKey;
  }

  /**
   * @param actionKey
   * @param gpKey
   * @returns
   */
  public assignGamepadKey(actionKey: AK, gpKey: KeyCode) {
    const keyAssign = this._assignMap.get(actionKey);
    if (!keyAssign) {
      // TODO: kbにもundefined設定できるようにする
      return this.defineKey(actionKey, "", gpKey);
    }
    keyAssign.gp = gpKey;
  }

  /**
   * @param json
   */
  public assignFromJson(json: { [actionTag in AK]: KeyAssignData }) {
    this._assignMap = new Map(Object.entries<KeyAssignData>(json) as [AK, any]);
    this._assignMap.forEach((_data, key) => {
      this._keyStateMap.set(key, 0);
    });
  }

  /**
   * キーアサイン状態をJSONオブジェクトにして返す
   */
  public toJSON() {
    return Object.fromEntries(this._assignMap) as {
      [keyName in AK]: KeyAssignData;
    };
  }

  /**
   * キーアサインMapを返す
   */
  public getAssignMap() {
    return this._assignMap;
  }

  /**
   * シャロ―クローン（keyAssignDataの参照はそのまま）を返す
   */
  public cloneAssignMap() {
    return new Map(this._assignMap);
  }

  /**
   * Return assignData of specifed action
   *
   * @param actionKey
   * @returns
   */
  public getKeyAssignData(actionKey: AK): KeyAssignData | undefined {
    const aData = this._assignMap.get(actionKey);
    if (!aData) {
      console.warn(`${actionKey} is not defined.`);
      return undefined;
    }
    return aData;
  }

  /**
   * [TEMP] キーコードからアクションを取得
   *
   * FIXME: 同じキーコードが割り当てられたアクションがあった場合、
   * 片方しか帰ってこない
   * 配列にする？
   *
   * @param code
   */
  public getActionTagFromCode(code: KeyCode): AK | undefined {
    for (const [actionKey, assignData] of this._assignMap.entries()) {
      if (
        assignData.kb === code ||
        (assignData.gp != null && assignData.gp === code)
      ) {
        return actionKey;
      }
    }
    return undefined;
  }

  public getActionTagFromGamePadCode(code: KeyCode): AK | undefined {
    for (const [actionKey, assignData] of this._assignMap.entries()) {
      if (assignData.gp != null && assignData.gp === code) {
        return actionKey;
      }
    }
  }

  /**
   * 直接app.keyboard/gamepadのkeyDown状態を参照して判定
   * @param actionKey
   */
  public keyDownRaw(actionKey: AK | DirectionKey): boolean {
    // DirectionKey
    if (actionKey === "up") return this.upKeyDown();
    if (actionKey === "left") return this.leftKeyDown();
    if (actionKey === "down") return this.downKeyDown();
    if (actionKey === "right") return this.rightKeyDown();

    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this.gamepadAvailable &&
      aData.gp != null &&
      this._app.gamepad!.getKeyDown(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKeyDown(aData.kb) || isGamepadActive;
  }

  /**
   * 登録したアクションキーor方向キーの押下したフレームだけtrueとなる処理
   *
   * 同フレームにて予め{@link InteractionController.updateKeyState}を実行しておくこと
   *
   * @param key
   * @param border 判定押下フレーム値を変更する場合に指定 (default:1)
   */
  public keyDown(key: AK | DirectionKey, border: number = 1): boolean {
    const ks = this._keyStateMap.get(key);
    return ks ? ks === border : false;
  }

  // /**
  //  * 未実装
  //  */
  // getAnyKeyDownFromKeyBoard(): KeyCode | undefined {
  //   // TODO
  //   return "";
  // }

  /**
   * いずれかのゲームパッドボタンのkeydownを検知
   *
   * - 同時押しの場合は片方のみ
   * - ゲームパッドが無効ならundefinedを返す
   *
   * @param targetKeyList 対象キー群。未指定のときは方向キー含む全てのボタンが対象
   * @returns 押したボタンのキーコード
   */
  public getAnyKeyDownFromGamepad(
    targetKeyList: KeyCode[] = (GAMEPAD_BUTTON_CODES as unknown) as KeyCode[]
  ): KeyCode | undefined {
    if (!this.gamepadAvailable) return undefined;
    const gp = this._app.gamepad!;
    return targetKeyList.find((keyCode) => gp.getKeyDown(keyCode));
  }

  /**
   * 二連続keydownを検知
   * enableDoubleKeyInputしてないときはシングル入力扱い
   */
  public doubleKeyDown(actionKey: AK): boolean {
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
   * 元のapp.keyboard/gamepadの状態をみて判定
   * @param actionKey
   */
  public keyPressRaw(actionKey: AK | DirectionKey): boolean {
    // DirectionKey
    if (actionKey === "up") return this.pressUp();
    if (actionKey === "left") return this.pressLeft();
    if (actionKey === "down") return this.pressDown();
    if (actionKey === "right") return this.pressRight();

    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this.gamepadAvailable &&
      aData.gp != null &&
      this._app.gamepad!.getKey(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKey(aData.kb) || isGamepadActive;
  }

  /**
   * 指定したアクションキーが入力中かどうか
   *
   * 同フレームにて予め{@link InteractionController.updateKeyState}を実行しておくこと
   *
   * @param key
   * 未登録の場合はfalseを返す
   *
   * @param threshold
   * 指定した経過フレーム数押下しつづけたかどうかで判定 (default: 0)
   * キーの長押し判定に使用
   */
  public keyPress(key: AK | DirectionKey, threshold = 0): boolean {
    const ks = this._keyStateMap.get(key);
    return ks != null ? ks > threshold : false;
  }

  /**
   * 元のapp.keyboard/gamepadの状態をみて判定
   * @param actionKey
   */
  public keyUpRaw(actionKey: AK | DirectionKey): boolean {
    // DirectionKey
    if (actionKey === "up") return this.upKeyUp();
    if (actionKey === "left") return this.leftKeyUp();
    if (actionKey === "down") return this.downKeyUp();
    if (actionKey === "right") return this.rightKeyUp();

    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;
    const isGamepadActive =
      this.gamepadAvailable &&
      aData.gp != null &&
      this._app.gamepad!.getKeyUp(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKeyUp(aData.kb) || isGamepadActive;
  }

  /**
   * 登録したアクションのキーを上げた瞬間
   *
   * 同フレームにて予め{@link InteractionController.updateKeyState}を実行しておくこと
   *
   * @param key 方向キー
   */
  public keyUp(key: AK | DirectionKey): boolean {
    const ks = this._keyStateMap.get(key);
    return ks != null ? ks === KEY_UP_FLG_NUM : false;
  }

  /**
   * ↑入力かどうか
   *
   * - ゲームパット・キーボード両方をチェック
   * - ゲームパットについては十字キー押下とアナログスティック傾きもチェックし、
   * どちらかがtrueなら入力しているとみなす
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
  public pressUp(): boolean {
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
   * 詳細は{@link InteractionController.pressUp}を参照
   *
   * @returns 入力中はtrueを返す
   */
  public pressDown(): boolean {
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

  /**
   * ←入力中かどうか
   * 詳細は{@link InteractionController.pressUp}を参照
   */
  public pressLeft() {
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

  /**
   * →入力中かどうか
   * 詳細は{@link InteractionController.pressUp}を参照
   */
  public pressRight() {
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
  public upKeyDown() {
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
   * ↓キーのkeydown
   */
  public downKeyDown() {
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
  public rightKeyDown() {
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
  public leftKeyDown() {
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

  /** 方向キー上のkeyUp判定 (keyboard/gam両対応) */
  public upKeyUp(): boolean {
    const isGpKeyUp = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const stickPrevAngle = gp.prevSticks[LEFT_STICK_ID];
        return gp.getKeyUp(UP_KEY_COMMON) || stickPrevAngle
          ? gp.getStickNeutral(LEFT_STICK_ID) &&
              stickPrevAngle.y <= -gp.stickDeadZoneThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyUp(UP_KEY_COMMON) || isGpKeyUp;
  }

  public downKeyUp(): boolean {
    const isGpKeyUp = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const stickPrevAngle = gp.prevSticks[LEFT_STICK_ID];
        return gp.getKeyUp(DOWN_KEY_COMMON) || stickPrevAngle
          ? gp.getStickNeutral(LEFT_STICK_ID) &&
              gp.stickDeadZoneThreshold <= stickPrevAngle.y
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyUp(DOWN_KEY_COMMON) || isGpKeyUp;
  }

  public rightKeyUp(): boolean {
    const isGpKeyUp = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const stickPrevAngle = gp.prevSticks[LEFT_STICK_ID];
        return gp.getKeyUp(RIGHT_KEY_COMMON) || stickPrevAngle
          ? gp.getStickNeutral(LEFT_STICK_ID) &&
              stickPrevAngle.x <= -gp.stickDeadZoneThreshold
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyUp(RIGHT_KEY_COMMON) || isGpKeyUp;
  }

  public leftKeyUp(): boolean {
    const isGpKeyUp = (() => {
      if (this.gamepadAvailable) {
        const gp = this._app.gamepad!;
        const stickPrevAngle = gp.prevSticks[LEFT_STICK_ID];
        return gp.getKeyUp(LEFT_KEY_COMMON) || stickPrevAngle
          ? gp.getStickNeutral(LEFT_STICK_ID) &&
              gp.stickDeadZoneThreshold <= stickPrevAngle.x
          : false;
      } else {
        return false;
      }
    })();
    return this._app.keyboard.getKeyUp(LEFT_KEY_COMMON) || isGpKeyUp;
  }

  /**
   * 記録したキー入力情報を破棄
   * リプレイ用
   */
  public resetRecordedInput(keysToRecord: (AK | DirectionKey)[]) {
    this.recordedKeyInputLog.length = 0;

    // 初期状態を0フレーム目の入力として記録
    this._keyStateMap.forEach((v, key) => {
      if (v > 0) {
        const keyId = keysToRecord.findIndex((ktr) => ktr === key);
        if (keyId > -1) {
          this.recordedKeyInputLog.push([0, keyId]);
        }
      }
    });
  }

  /**
   * 変化した入力を記録
   * リプレイ用
   *
   * @param keysToRecord
   * @param frame フレーム値
   */
  public recordInput(keysToRecord: (AK | DirectionKey)[], frame: number) {
    keysToRecord.forEach((key, keyId) => {
      if (this.keyDown(key) || this.keyUp(key)) {
        this.recordedKeyInputLog.push([frame, keyId]);
      }
    });
  }

  /**
   * 内部キー状態を変更
   * 押下 <=> 離すを切り替える
   *
   * リプレイなどの自動操作用
   *
   * @param key
   */
  public toggleKeyState(key: AK | DirectionKey) {
    const keyStateMap = this._keyStateMap;
    if (!keyStateMap.has(key)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[pgul]: キー"${key}"は定義されてません`);
      }
      return;
    }
    if (keyStateMap.get(key)! > 0) {
      // keyDown -> Up
      keyStateMap.set(key, KEY_UP_FLG_NUM);
    } else {
      // keyUp -> Down
      keyStateMap.set(key, 1);
    }
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

  /**
   * @param keycode
   * @returns
   */
  static isDirectionKeyCode(keycode: KeyCode) {
    // TODO: number型の場合の処理追加
    return DIRECTION_KEYS.includes(keycode as DirectionKey);
  }
}
