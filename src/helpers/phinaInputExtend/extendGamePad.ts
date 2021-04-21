import { Bit } from "../../utilTypes";
import { Vector2 } from "../../Vector2";
import { DEFAULT_GAMEPAD_THRESHOLD } from "./const";
import { App, PhinaGamepad } from "./types";

/**
 * Add gamepad locking feature via window focus/defocus
 */
function extendFocusLockFeature(gamepad: PhinaGamepad) {
  gamepad.isLocked = false;

  // getXxx methods override
  const superGetKey = gamepad.getKey.bind(gamepad);
  gamepad.getKey = function (...args) {
    if (this.isLocked) return false;
    return superGetKey(...args);
  };
  const superGetKeyDown = gamepad.getKeyDown.bind(gamepad);
  gamepad.getKeyDown = function (...args) {
    if (this.isLocked) return false;
    return superGetKeyDown(...args);
  };
  const superGetKeyUp = gamepad.getKeyUp.bind(gamepad);
  gamepad.getKeyUp = function (...args) {
    if (this.isLocked) return false;
    return superGetKeyUp(...args);
  };

  // Update locked state
  window.addEventListener("focus", () => {
    gamepad.isLocked = !document.hasFocus();
  });
  window.addEventListener("blur", () => {
    gamepad.isLocked = !document.hasFocus();
  });

  // 最初の起動時のフォーカス状態に応じてロック状態変更
  gamepad.isLocked = !document.hasFocus();
}

/**
 * Add thumbstick tilt detecting feature to app
 */
function extendStickTiltDetectFeature(app: App) {
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
    gamepad.sticks.forEach((_stick, id) => {
      gamepad.tiltLast[id] = gamepad.tilting[id];
      gamepad.tilting[id] = gamepad.currentTilt[id];
      gamepad.tiltDown[id] = ((gamepad.tilting[id] ^ gamepad.tiltLast[id]) &
        gamepad.tilting[id]) as Bit;
    });
  });

  /* getStickTilt実装 */
  gamepad.getStickTilt = function (stickId) {
    return gamepad.tiltDown[stickId] == 1;
  };
}

/**
 * gamepadオブジェクトを独自拡張
 *
 * @param app
 */
export default function extendGamePad(app: App) {
  if (!app.gamepad) return;
  const gamepad = app.gamepad;

  extendStickTiltDetectFeature(app);
  extendFocusLockFeature(gamepad);

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
