import { RunnerDriven } from "../../src/mixins/RunnerDriven";
import { Runner } from "../../src/Runner/index";

class RunnerDrivenObj2D extends RunnerDriven(
  class {
    children = undefined;
    x = 0;
    y = 0;
  }
) {}
function* xStepAction(this: Runner) {
  while (true) {
    this.target.x += 2;
    yield;
  }
}
function* yStepAction(this: Runner) {
  while (true) {
    this.target.y += 1;
    yield;
  }
}

describe("mixins/RunnerDriven#setActionRunner", () => {
  test("Basic: target should be updated by RunnerAction", () => {
    const rdObj2D = new RunnerDrivenObj2D();
    rdObj2D.setActionRunner(xStepAction);

    rdObj2D.updateRunners();

    expect(rdObj2D.x).toBe(2);
  });

  test("Set parallel action runners", () => {
    const rdObj2D = new RunnerDrivenObj2D();
    rdObj2D.setActionRunner([
      // prettier-ignore
      xStepAction,
      yStepAction,
    ]);

    // Update
    rdObj2D.updateRunners();

    expect(rdObj2D.x).toBe(2);
    expect(rdObj2D.y).toBe(1);
  });
});

describe("mixins/RunnerDriven#setParallelActionRunner", () => {
  test("Default", () => {
    const rdObj2D = new RunnerDrivenObj2D();
    rdObj2D.setParallelActionRunner([
      xStepAction,
      [
        xStepAction,
        yStepAction, // Won't be reached
      ],
    ]);

    rdObj2D.updateRunners();

    expect(rdObj2D.x).toBe(4);
    expect(rdObj2D.y).toBe(0);
  });
});

// TODO
// describe("mixins/RunnerDriven#setActionPattern", () => {});
