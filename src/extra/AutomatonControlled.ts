import { GConstructor } from "../core/utilTypes";
import { Automaton, StateBehaviour } from "./Automaton";

/**
 * AutomatonControlled
 *
 * Helper xixin adding {@link Automaton} controlling methods.
 *
 * {@link Automaton}関連処理を付与するmixin
 *
 * @param Base
 */
export function AutomatonControlled<TBase extends GConstructor>(Base: TBase) {
  return class extends Base {
    automaton?: Automaton;

    installAutomaton<SL extends string>(
      dataMap: Record<SL, StateBehaviour<this, SL>>
    ) {
      if (!this.automaton) this.automaton = new Automaton(this);

      // Register states
      {
        const automaton = this.automaton;
        Object.entries(dataMap).forEach(([k, v]) => {
          // @ts-ignore FIXME: v Type unknown error
          automaton.registerState(k, v);
        });
      }

      return this.automaton;
    }

    updateAutomaton() {
      this.automaton?.update();
    }

    removeAutomaton() {
      delete this.automaton;
    }
  };
}
