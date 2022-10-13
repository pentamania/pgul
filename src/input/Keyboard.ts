import * as KeyCode from "keycode-js";

/** KeyboardEvent.code Union type */
export type KbCode = typeof KeyCode[keyof typeof KeyCode]; // valueof

/**
 * Keyboard
 */
export class Keyboard {
  /** <keyCode => pressed> Map */
  protected keyMap: { [key in KbCode]?: boolean } = Object.create(null);

  private _keydownHandler = (e: KeyboardEvent) => {
    this.keyMap[e.code as KbCode] = true;
  };

  private _keyupHandler = (e: KeyboardEvent) => {
    this.keyMap[e.code as KbCode] = false;
  };

  constructor(activate = true) {
    if (activate) this.activate();
  }

  public getKey(key: KbCode): boolean {
    return this.keyMap[key] === true;
  }

  activate() {
    document.addEventListener("keydown", this._keydownHandler);
    document.addEventListener("keyup", this._keyupHandler);
  }

  kill() {
    document.removeEventListener("keydown", this._keydownHandler);
    document.removeEventListener("keyup", this._keyupHandler);
  }
}
