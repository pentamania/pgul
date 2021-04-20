import { Bit } from "../../utilTypes";
import { Vector2 } from "../../Vector2";
import { DEFAULT_GAMEPAD_THRESHOLD } from "./const";
import { App } from "./types";

/**
 * gamepadオブジェクトを独自拡張
 *
 * @param app
 */
export default function extendGamePad(app: App) {
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
