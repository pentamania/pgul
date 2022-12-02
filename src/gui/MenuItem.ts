/**
 * Menuableのitemとして追加可能な型
 *
 * @example
 * import { Foo } from "./foo";
 * class OptionItem extends Foo implements FocusableMenuItem {
 *   focus() { this.alpha = 1.0 }
 *   defocus() { this.alpha = 0.5 }
 *   execute() { console.log("hallow!") }
 * }
 */
export interface FocusableMenuItem {
  focus: Function;
  defocus: Function;
  execute?: Function;

  /** Turn on when you want to disable selection of this item */
  isLocked?: boolean;
}
