import { BaseRunner, ActionDictionary } from "../../src/runner/index";

class Vec {
  x = 0;
  y = 0;
}
function* xGotoAction(this: BaseRunner<Vec>, x: number, duration: number) {
  let _cnt = duration;
  const progressUnit = (x - this.target!.x) / duration;
  while (_cnt-- !== 0) {
    yield (this.target!.x += progressUnit);
  }
}

const destX = 2;
const testDuration = 10;
const expectedX = destX / testDuration;

describe("BaseRunner#addAction", () => {
  test("Should target.x be value set by runner-action", () => {
    const vec = new Vec();
    const rnr = new BaseRunner<Vec>(vec);

    // Add action and step
    rnr.addAction(xGotoAction, destX, testDuration);
    rnr.reset().step();

    expect(vec.x).toBeCloseTo(expectedX);
  });
});

describe("BaseRunner#addActionByName", () => {
  // Register action
  ActionDictionary.register("xGoto", xGotoAction);

  test("Should 'goto' action work: Sets x to expectedX", () => {
    const hero = new Vec();
    const rnr = new BaseRunner<Vec, "xGoto">(hero);

    // Add action and step
    rnr.addActionByName("xGoto", destX, testDuration); // Moves 0.2/step
    rnr.reset().step();

    expect(hero.x).toBeCloseTo(expectedX);
  });
});
