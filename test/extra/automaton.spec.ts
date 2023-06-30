import { Automaton } from "../../src/extra/Automaton";
import { AutomatonControlled } from "../../src/extra/AutomatonControlled";

describe("extra/AutomatonControlled", () => {
  const DummyUserInput = {
    pressRight: () => true,
    reset() {
      this.pressRight = () => true;
    },
  };

  type StateTag = "idle" | "moving";
  class BaseEntity {
    x = 0;
    vecX = 0;
    /* Dummy */
    changeAnimation(_state: StateTag) {}
  }

  class Entity extends AutomatonControlled(BaseEntity) {
    // Declaration for existance-check and label-typing
    declare automaton: Automaton<this, StateTag>;

    constructor() {
      super();
      this.installAutomaton<StateTag>({
        // state No.1
        idle: {
          enter: () => {
            this.changeAnimation("idle");
            this.vecX = 0;
          },
          update() {
            if (DummyUserInput.pressRight()) {
              // * "this" should be Entity
              this.vecX = 2;
              return "moving";
            }
            return;
          },
        },

        // state No.2
        moving: {
          enter() {
            this.changeAnimation("moving");
          },
          update() {
            this.x += this.vecX;

            if (DummyUserInput.pressRight()) {
              // Continue state
              return;
            } else {
              // Slowdown
              this.vecX -= 1;
              if (Math.abs(this.vecX) < 0.1) {
                return "idle";
              }
            }
            return;
          },
        },
      })
        // Set init state
        .setState("idle");
    }

    update() {
      this.updateAutomaton();
    }
  }

  // Main
  test("Should default automaton state be 'idle'", () => {
    DummyUserInput.reset();
    const obj = new Entity();

    const result = obj.automaton?.currentState;
    const expected = "idle";
    expect(result).toBe(expected);
  });

  test("Should state become 'moving' after 1st update", () => {
    DummyUserInput.reset();
    const obj = new Entity();

    // 1st
    obj.update();

    expect(obj.automaton.currentState).toBe("moving");
  });

  test("Should state return to 'idle' after some updating", () => {
    DummyUserInput.reset();
    const obj = new Entity();
    obj.update();

    // User released the button
    DummyUserInput.pressRight = () => false;

    // slowdown -> state back to "idle"
    while (0 < obj.vecX) {
      obj.update();
    }

    expect(obj.automaton.currentState).toBe("idle");
  });

  test("Should automaton removed after removeAutomaton", () => {
    const obj = new Entity();
    obj.removeAutomaton();
    expect(obj.automaton).toBeFalsy();
  });
});
