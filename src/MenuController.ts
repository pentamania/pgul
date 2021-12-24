import { Menuable } from "./mixins/Menuable";

/** Menuable拡張クラス型 */
abstract class Menu extends Menuable(
  class {
    /**
     * @virtual
     * メニューを有効化
     * 選択肢を表示したりなど
     */
    activate() {}

    /**
     * @virtual
     * メニューを非アクティブ化
     */
    deactivate() {}
  }
) {}

/**
 * メニュー管理クラス
 *
 * メニューコンポーネントは三つの段階に分かれる
 * - Item：Menuの子に当たる概念
 * - Menu：メニュー本体
 * - Controller: 複数のMenuを切替・管理する
 *
 * @example
 * // TODO
 *
 */
export class MenuController<ML = any> {
  private _currentMenu?: Menu;
  private _menuMap: Map<ML, Menu> = new Map();
  private _prevMenuStack: Menu[] = [];

  /**
   * メニュー切替
   * Deactivate current menu
   * -> Set (activated) specified menu
   *
   * @param menu menu to activate
   */
  private _setActiveMenu(menu: Menu) {
    if (this._currentMenu) this._currentMenu.deactivate();
    menu.activate();
    this._currentMenu = menu;
  }

  /**
   * メニュー追加
   *
   * @param label Menu label
   * @param menu
   */
  addMenu(label: ML, menu: Menu) {
    this._menuMap.set(label, menu);
  }

  /**
   * ラベルでメニューを取得
   *
   * @param label Menu label
   * @returns
   */
  getMenu(label: ML) {
    return this._menuMap.get(label);
  }

  /**
   * アクティブにしたいメニューをlabel指定
   */
  setActiveMenu(label: ML) {
    if (this._currentMenu) {
      // 現在のメニューをスタック記録
      this._prevMenuStack.push(this._currentMenu);
    }

    let nextMenu = this.getMenu(label);
    if (nextMenu) this._setActiveMenu(nextMenu);
  }

  /**
   * 直前のメニューに戻る
   *
   * @returns 前メニューの有無をBooleanで返す
   */
  backToPrevMenu(resetCurrent: boolean = false): boolean {
    const prevMenu = this._prevMenuStack.pop();
    if (!prevMenu) {
      return false;
    }
    if (this._currentMenu && resetCurrent) this._currentMenu.selectItem(0);
    this._setActiveMenu(prevMenu);
    return true;
  }

  /**
   * メニュー履歴をクリア
   */
  clearHistory() {
    this._prevMenuStack.length = 0;
  }

  /**
   * 選択中の項目オブジェクトを実行.
   * ラベル文字列を返した場合、対応するメニューをアクティブ化
   *
   * @returns 実行結果を返す
   */
  runOption(...args: Parameters<typeof Menu.prototype.runOption>) {
    if (!this.currentMenu) return;
    const runResult = this.currentMenu.runOption(...args);
    if (typeof runResult === "string") {
      this.setActiveMenu((runResult as unknown) as ML);
    }
    return runResult;
  }

  /**
   * ひとつ前の項目を選択
   *
   * @returns
   */
  selectPrevOption() {
    if (!this.currentMenu) {
      // TODO: warn?
      return;
    }
    return this.currentMenu.selectPrev();
  }

  /**
   * ひとつ後の項目を選択
   *
   * @returns
   */
  selectNextOption() {
    if (!this.currentMenu) {
      // TODO: warn?
      return;
    }
    return this.currentMenu.selectNext();
  }

  get currentMenu() {
    return this._currentMenu;
  }

  /** 直前のメニュー参照を取得 */
  get previousMenu(): Menu | undefined {
    return this._prevMenuStack[this._prevMenuStack.length - 1];
  }
}
