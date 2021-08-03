import { Poolable } from "../../src/mixins/Poolable";

describe("Poolable", () => {
  // Sample class
  class Actor extends Poolable(class {}) {
    name: string = "";
    remove() {
      this.isPoolPickable = true;
    }
    resetParam() {
      this.name = Actor.defaultName;
      this.isPoolPickable = false;
    }
    static pick: () => Actor;
    static defaultName = "John Doe";
  }

  test("Pooled object should be same", () => {
    // Newly created
    const actor = Actor.pick();

    // Back to pool
    actor.remove();

    // Picked from pool
    const otherActor = Actor.pick();
    expect(otherActor).toBe(actor);
  });

  test("Object returned to pool should be reset", () => {
    // Newly created: Change name
    const actor = Actor.pick();
    actor.name = "Alice";

    // Back to pool
    actor.remove();

    // Picked from pool
    const otherActor = Actor.pick();
    expect(otherActor.name).toBe(Actor.defaultName);
  });
});
