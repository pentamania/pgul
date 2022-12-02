import { Poolable } from "../../src/pooling/Poolable";

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
    declare static pick: () => Actor;
    static defaultName = "John Doe";
  }

  test("Basic: Should object be same when it is re-picked after pooled", () => {
    // Newly created
    const actor = Actor.pick();

    // Back to pool
    actor.remove();

    // Picked from pool
    const rePickedActor = Actor.pick();
    expect(rePickedActor).toBe(actor);
  });

  test("resetParam test: Should object 'name' reset when picked from pool", () => {
    // Newly created: Change name
    const actor = Actor.pick();
    actor.name = "Alice";

    // Back to pool
    actor.remove();

    // Picked from pool
    const rePickedActor = Actor.pick();
    expect(rePickedActor.name).toBe(Actor.defaultName);
  });
});
