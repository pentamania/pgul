import { Bit } from "../../utilTypes";
import { Vector2 } from "../../Vector2";

export type KeyCode = string | number;

export interface keyAssignData {
  kb: KeyCode;
  gp?: KeyCode;
}

/**
 * phina.app.DomApp想定
 */
export interface App {
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
