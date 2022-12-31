import { MenuController } from "../../src/gui/menu/MenuController";
import { Menuify } from "../../src/gui/menu/Menuify";
import { FocusableMenuItem } from "../../src/gui/menu/MenuItem";

// Item
class MainMenuItem implements FocusableMenuItem {
  id: number = 0;
  alpha = 0.5;

  focus() {
    this.alpha = MainMenuItem.alphaValWhenActive;
  }
  defocus() {
    this.alpha = 0.5;
  }
  isActive(): boolean {
    return this.alpha === MainMenuItem.alphaValWhenActive;
  }
  execute() {
    console.log("Do something");
  }

  static alphaValWhenActive = 1.0;
}

// Menu
class DummyContainer {}

class MainMenu extends Menuify<typeof DummyContainer, MainMenuItem>(
  DummyContainer
) {
  active = false;
  constructor() {
    super();

    // Add items
    for (let i = 0; i < 4; i++) {
      const item = new MainMenuItem();
      item.id = i;
      this.appendItem(item);
    }
  }
  activate() {
    this.active = true;
  }
  deactivate() {
    this.active = false;
  }
}

// Labels
const MenuEnum = {
  MAIN: "main",
} as const;
type MenuLabel = typeof MenuEnum[keyof typeof MenuEnum];

describe("MenuController#setActiveMenu", () => {
  test("Should default item of currentMenu be active", () => {
    const mc = new MenuController<MenuLabel, MainMenu>();

    // Setup MainMenu
    mc.addMenu(MenuEnum.MAIN, new MainMenu());
    mc.setActiveMenu("main");

    const currenMenu = mc.currentMenu!;
    expect(currenMenu.currentItem.isActive()).toBeTruthy();
  });

  test("Should currentMenu be reset by resetState option", () => {
    const mc = new MenuController<MenuLabel, MainMenu>();

    // Setup mainMenu
    mc.addMenu(MenuEnum.MAIN, new MainMenu());
    mc.setActiveMenu("main");

    // Change state
    mc.selectNextOption();

    // Reset menu by resetState option
    mc.setActiveMenu("main", true);

    expect(mc.currentMenu!.currentItem.id).toBe(0);
  });
});
