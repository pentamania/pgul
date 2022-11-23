import { ContextBindableGeneratorFunction } from "../utilTypes";
import { BaseRunner } from "./BaseRunner";

export class ActionDictionary {
  static map: Map<string, ContextBindableGeneratorFunction> = new Map();

  static register<R extends BaseRunner = BaseRunner>(
    name: string,
    genFunc: ContextBindableGeneratorFunction<R>
  ) {
    this.map.set(name, genFunc);
  }

  static get(name: string) {
    return this.map.get(name);
  }
}
