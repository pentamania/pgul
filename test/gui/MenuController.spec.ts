import {
  MenuController,
  MenuRequiredProps,
} from "../../src/gui/menu/MenuController";
import { Menuify } from "../../src/gui/menu/Menuify";
import { FocusableMenuItem } from "../../src/gui/menu/MenuItem";

// Item class
class MenuItem implements FocusableMenuItem {
  id: number = 0;
  alpha = 0.5;

  focus() {
    this.alpha = MenuItem.alphaValWhenActive;
  }
  defocus() {
    this.alpha = 0.5;
  }

  /** Helper method to check that the item is selected */
  isActive(): boolean {
    return this.alpha === MenuItem.alphaValWhenActive;
  }

  /** @virtual */
  execute() {
    console.log("Do something");
  }

  static alphaValWhenActive = 1.0;
}

/** Common MenuBase */
class BaseObj implements MenuRequiredProps {
  active = false;
  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
}
class MenuCommon extends Menuify<typeof BaseObj, MenuItem>(BaseObj) {}

// Menus
class MainMenu extends MenuCommon {
  constructor() {
    super();

    // Add items
    for (let i = 0; i < 4; i++) {
      const item = new MenuItem();
      item.id = i;
      this.appendItem(item);
    }
  }
}

class SubMenu extends MenuCommon {
  constructor() {
    super();

    for (let i = 0; i < 2; i++) {
      const item = new MenuItem();
      item.id = i;
      this.appendItem(item);
    }
  }
}

// Label-enum
const MenuEnum = {
  MAIN: "main",
  SUB: "sub",
} as const;
type MenuLabel = typeof MenuEnum[keyof typeof MenuEnum];

/** Custom menu controller */
class MyMenuController extends MenuController<MenuLabel, MenuCommon> {
  constructor() {
    super();
    this.addMenu(MenuEnum.MAIN, new MainMenu());
    this.addMenu(MenuEnum.SUB, new SubMenu());
    this.setActiveMenu("main");

    // Implement process to  main item No.1
    this.getMenu("main")!.items[0].execute = () => this.setActiveMenu("sub");
  }
}

// Test
describe("MenuController#active-menu", () => {
  test("Should default item of currentMenu be active", () => {
    const mc = new MyMenuController();
    expect(mc.currentMenu!.currentItem.isActive()).toBeTruthy();
  });

  test("Should currentMenu be reset by resetState option", () => {
    const mc = new MyMenuController();

    // Change state
    mc.selectNextOption();

    // Reset menu by resetState option
    mc.setActiveMenu("main", true);

    // The 1st item(id:0) should be set as default
    expect(mc.currentMenu!.currentItem.id).toBe(0);
  });

  test("Should currentMenu switched to subMenu when mainMenu-item-No.1 is executed", () => {
    const mc = new MyMenuController();
    mc.setActiveMenu("main", true);
    mc.runOption();
    expect(mc.currentMenu instanceof SubMenu).toBeTruthy();
  });
});
