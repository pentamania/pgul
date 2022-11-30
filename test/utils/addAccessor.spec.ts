import { addAccessor } from "../../src/utils/addAccessor";

describe("utils/addAccessor: Add 'diameter' prop to Circ by addAccessor", () => {
  // Base
  class Circ {
    radius = 16;
  }

  // Extend
  interface Circ {
    diameter: number;
  }
  addAccessor(Circ.prototype, "diameter", {
    get() {
      return this.radius * 2;
    },
    set(v: number) {
      this.radius = v / 2;
    },
  });

  test("Should new getter 'diameter' work", () => {
    const foo = new Circ();
    foo.radius = 50;
    expect(foo.diameter).toBe(foo.radius * 2);
  });

  test("Should new setter 'diameter' work", () => {
    const foo = new Circ();
    foo.diameter = 100;

    expect(foo.radius).toBe(foo.diameter / 2);
  });
});
