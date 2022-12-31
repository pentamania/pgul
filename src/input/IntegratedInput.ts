import {
  Direction,
  DirectionKeys,
  D_DOWN,
  D_LEFT,
  D_RIGHT,
  D_UP,
} from "./Directions";
import { GamepadExtension, GpButtonId, GpCodeAll } from "./GamepadEx";
import { KbCode } from "./KbCode";
import { StatedKeyboard } from "./StatedKeyboard";

// keyboard 方向キー種別
const KB_UP: KbCode = "ArrowUp";
const KB_DOWN: KbCode = "ArrowDown";
const KB_LEFT: KbCode = "ArrowLeft";
const KB_RIGHT: KbCode = "ArrowRight";
const KbDirections = [KB_UP, KB_DOWN, KB_LEFT, KB_RIGHT] as const;
type KbDirection = typeof KbDirections[number];

export interface KeyAssignData {
  /** 登録Keyboardキー */
  kb?: KbCode;

  /**
   * 登録したいgamepadのボタンid（任意）
   */
  gp?: GpCodeAll;
}

/** keyboard & gamepadボタン型の統合型 */
export type IntegratedCode = KbCode | GpButtonId;
export type KeyAssignMap<T> = Map<T, KeyAssignData>;
export type ActionLabelDefault = string | number;

const directionKeyAssigns: [Direction, KeyAssignData][] = [
  [D_UP, { kb: "ArrowUp", gp: D_UP }],
  [D_DOWN, { kb: "ArrowDown", gp: D_DOWN }],
  [D_LEFT, { kb: "ArrowLeft", gp: D_LEFT }],
  [D_RIGHT, { kb: "ArrowRight", gp: D_RIGHT }],
];

/**
 * keyboardとgamepadで共通のキーを定義し、
 * それをもってどちらの入力にも対応したラッパークラス
 *
 * @example
 * const input = new IntegratedInput<"fire">()
 * input.defineKey("fire", "KeyZ", 1);
 * if (input.getKeyPress("fire")) doFiring()
 */
export class IntegratedInput<AL extends ActionLabelDefault> {
  /** <ActionLabel => KeyAssign> Map */
  _assignMap: KeyAssignMap<AL | Direction> = new Map([...directionKeyAssigns]);

  // 内部input
  readonly keyboard: StatedKeyboard = new StatedKeyboard(true);
  readonly gamepad: GamepadExtension;

  constructor(gamepadIndex?: number) {
    this.gamepad = new GamepadExtension(gamepadIndex);
  }

  /**
   * キー定義
   *
   * @example
   * const input = new IntegratedInput<"fire">()
   * input.defineKey("fire", "KeyZ", 1);
   *
   * @param actionKey
   * @param kbKey
   * @param gpCode
   */
  public defineKey(actionKey: AL, kbKey?: KbCode, gpCode?: GpButtonId) {
    this._assignMap.set(actionKey, {
      kb: kbKey,
      gp: gpCode,
    });
    if (kbKey) this.keyboard.initializeKeyMap(kbKey);
  }

  public assignKeyboard(label: AL, code: KbCode) {
    const assign = this._assignMap.get(label);
    if (!assign) return;
    assign.kb = code;
  }

  public assignGamepad(label: AL, code: GpButtonId) {
    const assign = this._assignMap.get(label);
    if (!assign) return;
    assign.gp = code;
  }

  /**
   * jsonでキーアサインマップを初期化
   *
   * @param json
   */
  public assignFromJson(json: { [action in AL]: KeyAssignData }) {
    this._assignMap = new Map([
      ...directionKeyAssigns,
      ...Object.entries(json),
    ] as [AL | Direction, KeyAssignData][]);

    // Kb reset
    this._assignMap.forEach((assign) => {
      if (assign.kb) this.keyboard.initializeKeyMap(assign.kb);
    });

    this.resetStateMap();
  }

  /**
   * キーアサイン状態をJSONオブジェクトにして返す
   */
  public convertAssignsToJSON(): { [action in AL]: KeyAssignData } {
    const json = Object.fromEntries(this._assignMap) as {
      [action in AL | Direction]: KeyAssignData;
    };
    // Directionを省く
    DirectionKeys.forEach((d) => delete json[d]);

    return json;
  }

  /**
   * ラベルから定義したアサイン情報取得
   * @param label
   * @returns アサイン情報、定義が無ければundefined
   */
  public getKeyAssignData(label: AL | Direction): KeyAssignData | undefined {
    return this._assignMap.get(label);
  }

  /**
   * 内部KeyStateを更新
   * 基本的に毎フレーム実行
   */
  public updateKeyStates(autoPlayMode?: boolean) {
    this.keyboard.updateKeyStates(autoPlayMode);
    this.gamepad.updateStates(autoPlayMode);
  }

  /**
   * keyboard&gamepad キー状態リセット
   */
  public resetStateMap() {
    this.keyboard.resetStateMap();
    this.gamepad.resetStateMap();
  }

  /**
   * 指定アクションキーが押下状態かどうか
   * @param actionLabel
   * @param threshold
   */
  public getKeyPress(actionLabel: AL | Direction, threshold = 0): boolean {
    const asn = this.getKeyAssignData(actionLabel);
    if (!asn) return false;
    return (
      this.keyboard.getKeyPress(asn.kb!, threshold) ||
      this.gamepad.getButtonPress(asn.gp!, threshold)
    );
  }

  public getKeyDown(actionLabel: AL | Direction, border?: number): boolean {
    const asn = this.getKeyAssignData(actionLabel);
    if (!asn) return false;
    return (
      this.keyboard.getKeyDown(asn.kb!, border) ||
      this.gamepad.getButtonDown(asn.gp!, border)
    );
  }

  public getKeyUp(actionLabel: AL | Direction): boolean {
    const asn = this.getKeyAssignData(actionLabel);
    if (!asn) return false;
    return this.keyboard.getKeyUp(asn.kb!) || this.gamepad.getButtonUp(asn.gp!);
  }

  /**
   * 割り当てたキーコード等から対応アクションラベルを取得
   *
   * ※方向キー(Direction)種は無視
   *
   * @param code
   * @returns
   * アクション名。見つからなかった場合はundefined
   * 同じキーコードが割り当てられたアクションがあった場合、片方しか帰ってこない
   * 配列にする？
   */
  public getActionLabelFromCode(
    code: IntegratedCode,
    inputType?: keyof KeyAssignData
  ): AL | undefined {
    // 方向キースキップ
    if (KbDirections.includes(code as KbDirection)) return undefined;

    for (const [label, assign] of (this._assignMap as Map<
      AL,
      KeyAssignData
    >).entries()) {
      if (inputType != null) {
        // input種を限定
        switch (inputType) {
          case "gp":
            if (assign.gp === (code as GpButtonId)) return label;
            break;

          default:
            // kb
            if (assign.kb === code) return label;
            break;
        }
      } else {
        // 未登録の場合はundefinedとの比較になる（-> 必ずfalse）
        if (assign.kb === code || assign.gp === code) {
          return label;
        }
      }
    }

    return undefined;
  }

  /**
   * gamepadボタンidから割り当てられているアクションを取得
   *
   * @param gpButtonId
   * @returns
   * アクション名。見つからなかった場合はundefined
   */
  public getActionLabelFromGamePadButton(
    gpButtonId: GpButtonId
  ): AL | undefined {
    return this.getActionLabelFromCode(gpButtonId, "gp");
  }
}
