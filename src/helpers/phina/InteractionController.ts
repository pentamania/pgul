import { Bit } from "../../utilTypes";
import { Vector2 } from "../../Vector2";

const DEFAULT_GAMEPAD_THRESHOLD = 0.3;
const DEFAULT_DOUBLE_INPUT_DELAY_FRAME = 16;
const LEFT_STICK_ID = 0;

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

type StrOrNum = string | number;
type KeyCode = string | number;

// phina.app.DomApp想定
interface App {
  on: (
    eventType: "enterframe",
    cb: (e: { type: "enterframe"; target: App }) => any
  ) => this;
  one: (
    eventType: "enterframe",
    cb: (e: { type: "enterframe"; target: App }) => any
  ) => this;
  keyboard: {
    getKey: (key: KeyCode) => boolean;
    getKeyDown: (key: KeyCode) => boolean;
    getKeyUp: (key: KeyCode) => boolean;
  };
  gamepad?: {
    getKey: (key: KeyCode) => boolean;
    getKeyDown: (key: KeyCode) => boolean;
    getKeyUp: (key: KeyCode) => boolean;

    /**
     * x, yでスティック状態を保持
     * 0 ~ 2の３本
     *
     * 本来はphina.geom.Vector2だがpgul.Vector2で代用
     * x/yプロパティ、cloneメソッドが必要
     */
    sticks: Vector2[];

    /**
     * 本来はphina.geom.Vector2を返却
     */
    getStickDirection: (stickId: number) => Vector2;

    /**
     * ラップ元GamePad(rawgamepad)のtimestampが更新（->何らかの状態更新があった）
     * されるたびに呼び出される関数
     *
     * わずかな変化でも呼び出されるので、
     * 一回入力のつもりでも何度も実行されがち
     * 特にアナログスティックを有効にするとほぼ毎フレーム実行される
     *
     * @override
     * @param {number} value
     * 新しい入力値：-1.0 – 1.0
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/axes
     * @param {number} stickId
     * @param {"x"|"y"} axisName 軸名
     */
    _updateStick: (value: number, stickId: number, axisName: "x" | "y") => void;

    // 以下独自拡張 ======================

    // 傾き管理フラグマップ群
    currentTilt: { [stickId: number]: Bit };
    tiltLast: { [stickId: number]: Bit };
    tilting: { [stickId: number]: Bit };
    tiltDown: { [stickId: number]: Bit };

    getStickTilt: (stickId: number) => boolean;
    // getStickNeutral: (stickId: number) => boolean;

    /**
     * getStickDirectionでいちいち新規作成せず、
     * こちらのベクトル参照を返す
     */
    _stickDirection: Vector2;

    /**
     * スティックが傾いたとする範囲
     */
    stickDeadZoneThreshold: number;
  };
}

export interface keyAssignData {
  kb: KeyCode;
  gp?: KeyCode;
}

export type KeyAssingMap<T> = Map<T, keyAssignData>;

/**
 * ゲームパッドを独自拡張
 * stick更新を無理やり拾う
 * できたらphina本体で諸々したほうがいい
 *
 * @param app
 */
function extendGamePad(app: App) {
  if (!app.gamepad) return;
  const gamepad = app.gamepad;

  /* 傾きしきい値の初期化 */
  gamepad.stickDeadZoneThreshold = DEFAULT_GAMEPAD_THRESHOLD;

  /* _updateStick拡張オーバライド */
  gamepad._updateStick = function (value, stickId, axisName) {
    if (!this.sticks[stickId]) {
      // ※本来はphina.geom.Vector2
      this.sticks[stickId] = new Vector2(0, 0);
    }
    this.sticks[stickId][axisName] = value;

    /* tilting flag update */
    {
      const vx = this.sticks[stickId]["x"];
      const vy = this.sticks[stickId]["y"];
      const threshold = this.stickDeadZoneThreshold;
      if (threshold <= Math.abs(vx) || threshold <= Math.abs(vy)) {
        this.currentTilt[stickId] = 1;
      } else {
        this.currentTilt[stickId] = 0;
      }
    }
  };

  /* 毎フレーム傾きフラグ更新処理 */
  gamepad.currentTilt = {};
  gamepad.tilting = {};
  gamepad.tiltLast = {};
  gamepad.tiltDown = {};
  app.on("enterframe", () => {
    const gp = gamepad;
    gp.sticks.forEach((_stick, id) => {
      gp.tiltLast[id] = gp.tilting[id];
      gp.tilting[id] = gp.currentTilt[id];
      gp.tiltDown[id] = ((gp.tilting[id] ^ gp.tiltLast[id]) &
        gp.tilting[id]) as Bit;
    });
  });

  /* getStickTilt実装 */
  gamepad.getStickTilt = function (stickId) {
    return gamepad.tiltDown[stickId] == 1;
  };

  /* getStickDirection override */
  gamepad._stickDirection = new Vector2(0, 0);
  gamepad.getStickDirection = function (stickId) {
    stickId = stickId || 0;
    this._stickDirection.x = this.sticks[stickId].x;
    this._stickDirection.y = this.sticks[stickId].y;
    return this._stickDirection;
    // return this.sticks ? this.sticks[stickId].clone() : new Vector2(0, 0);
  };
}

/**
 * phinaのインタラクション処理を統合処理
 *
 * phina.jsのgamepad APIについて
 * @see https://qiita.com/minimo/items/27020fdb66375f1f868b
 *
 */
export class InteractionController<AK extends StrOrNum = StrOrNum> {
  private _app!: App;
  private _assignMap: KeyAssingMap<AK> = new Map();
  // private _doubleKeySuspendCountMap: {[key:AK]: number} = {}
  private _doubleKeySuspendCountMap: Map<AK, number> = new Map();
  private _doubleKeyDownAcceptThreshold: number = DEFAULT_DOUBLE_INPUT_DELAY_FRAME;

  // constructor(app) {
  // }

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
  toJSON(): { [keyName in StrOrNum]: keyAssignData } {
    return Object.fromEntries(this._assignMap);
  }

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
   * @param actionKey
   */
  keyDown(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this._app.gamepad && aData.gp && this._app.gamepad.getKeyDown(aData.gp)
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
   * @param actionKey
   */
  keyPress(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;

    const isGamepadActive =
      this._app.gamepad && aData.gp && this._app.gamepad.getKey(aData.gp)
        ? true
        : false;
    return this._app.keyboard.getKey(aData.kb) || isGamepadActive;
  }

  /**
   * 登録したアクションのキーを上げた瞬間
   * @param actionKey
   */
  keyUp(actionKey: AK): boolean {
    const aData = this.getKeyAssignData(actionKey);
    if (!aData) return false;
    const isGamepadActive =
      this._app.gamepad && aData.gp && this._app.gamepad.getKeyUp(aData.gp)
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKey(UP_KEY_COMMON) || gpAngle
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKey(DOWN_KEY_COMMON) || gpAngle
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKey(LEFT_KEY_COMMON) || gpAngle
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKey(RIGHT_KEY_COMMON) || gpAngle
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
   * GPのgetKeyDownは何故か効かないことがある
   */
  upKeyDown() {
    const isGpKeyDown = (() => {
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKeyDown(UP_KEY_COMMON) || gpAngle
          ? this._app.gamepad.getStickTilt(LEFT_STICK_ID) &&
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
   * GPのgetKeyDownは何故か効かないことがある
   */
  downKeyDown() {
    const isGpKeyDown = (() => {
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKeyDown(DOWN_KEY_COMMON) || gpAngle
          ? this._app.gamepad.getStickTilt(LEFT_STICK_ID) &&
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKeyDown(RIGHT_KEY_COMMON) || gpAngle
          ? this._app.gamepad.getStickTilt(LEFT_STICK_ID) &&
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
      if (this._app.gamepad) {
        const gpAngle = this._app.gamepad.getStickDirection(LEFT_STICK_ID);
        return this._app.gamepad.getKeyDown(LEFT_KEY_COMMON) || gpAngle
          ? this._app.gamepad.getStickTilt(LEFT_STICK_ID) &&
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
}
