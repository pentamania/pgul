const AXIS_INDEX_X = 0;
const AXIS_INDEX_Y = 1;

/**
 *
 * @param index
 * [jp]
 * 指定したindexのゲームパットの場合のみ認識
 * 未指定の場合はどのゲームパットも認識
 */
export async function waitConnection(index?: number) {
  return new Promise<GamepadEvent>((resolve, _reject) => {
    const listener = (e: GamepadEvent) => {
      if (index != null) {
        if (e.gamepad.index === index) {
          window.removeEventListener("gamepadconnected", listener);
          resolve(e);
        }
      } else {
        window.removeEventListener("gamepadconnected", listener);
        resolve(e);
      }
    };
    window.addEventListener("gamepadconnected", listener);
  });
}

/**
 * @param index
 * [jp]
 * - 指定したindexのゲームパットを探す
 * - 未指定の場合、全gamepadから接続されているものを探して返却
 */
export function getGamepad(index?: number): Gamepad | null {
  if (index != null) {
    return window.navigator.getGamepads()[index];
  } else {
    return window.navigator.getGamepads().find((gp) => gp != null) || null;
  }
}

export function getPressedButtonIndices(gp: Gamepad): number[] {
  return gp.buttons.reduce((arr, btn, i) => {
    if (btn.pressed) arr.push(i);
    return arr;
  }, [] as number[]);
}

/**
 * [jp]
 * GamepadスティックがX軸方向に傾いているかを取得（正負問わず）
 *
 * @example
 * const gp = navigator.getGamepads()[0];
 * isStickTiltingX(gp)
 *
 * @param gp
 * @param threshold
 * @returns
 */
export function isStickTiltingX(gp: Gamepad, threshold: number = 0.1): boolean {
  return Math.abs(gp.axes[AXIS_INDEX_X]) > threshold;
}

export function isStickTiltingY(gp: Gamepad, threshold: number = 0.1): boolean {
  return Math.abs(gp.axes[AXIS_INDEX_Y]) > threshold;
}

// -1.0 ~ 1.0
export function getStickX(gp: Gamepad): number {
  return gp.axes[AXIS_INDEX_X];
}

export function getStickY(gp: Gamepad): number {
  return gp.axes[AXIS_INDEX_Y];
}

/** 一般的なゲームパットのボタン数をカバー  */
export const GAMEPAD_COMMON_BUTTON_CODES = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
] as const;

/**
 * Gamepadの接続・切断を監視
 *
 * @example
 * const { gamepadHelper } = pgul;
 *
 * const moni = new gamepadHelper.GamepadMonitor();
 * moni.onConnect = (gp) => {
 *   console.log("connected:", gp.id);
 * };
 * moni.onDisConnect = (gp) => {
 *   console.log("disconnectedted:", gp.id);
 * };
 */
export class GamepadMonitor {
  private _activated = false;

  private _onConnectListener: (e: GamepadEvent) => any = (e) => {
    this.onConnect(e.gamepad);
  };

  private _onDisConnectListener: (e: GamepadEvent) => any = (e) => {
    this.onDisConnect(e.gamepad);
  };

  constructor() {
    this.activate();
  }

  activate() {
    if (this._activated) return;
    window.addEventListener("gamepadconnected", this._onConnectListener);
    window.addEventListener("gamepaddisconnected", this._onDisConnectListener);
    this._activated = true;
  }

  kill() {
    window.removeEventListener("gamepadconnected", this._onConnectListener);
    window.removeEventListener(
      "gamepaddisconnected",
      this._onDisConnectListener
    );
    this._activated = false;
  }

  /** @virtual */
  onConnect(_gamepad: Gamepad) {}

  /** @virtual */
  onDisConnect(_gamepad: Gamepad) {}
}
