import { RunnerDriven } from "../../src/mixins/RunnerDriven";

class RunnerDrivenObj2D extends RunnerDriven(
  class {
    children = undefined;
    x = 0;
    y = 0;
  }
) {}

describe("mixins/RunnerDriven#setActionRunner", () => {
  test("Basic: target should be updated by RunnerAction", () => {
    const rdObj2D = new RunnerDrivenObj2D();
    rdObj2D.setActionRunner(function* () {
      while (true) {
        this.target.x += 2;
        yield;
      }
    });

    rdObj2D.updateRunners();

    expect(rdObj2D.x).toBe(2);
  });

  test("Set parallel action runners", () => {
    const rdObj2D = new RunnerDrivenObj2D();
    rdObj2D.setActionRunner([
      function* () {
        while (true) {
          this.target.x += 2;
          yield;
        }
      },
      function* () {
        while (true) {
          this.target.y += 1;
          yield;
        }
      },
    ]);

    // Update
    rdObj2D.updateRunners();

    expect(rdObj2D.x).toBe(2);
    expect(rdObj2D.y).toBe(1);
  });
});

// TODO
// describe("mixins/RunnerDriven#setActionPattern", () => {});
