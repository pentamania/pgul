import { BaseRunner } from "./BaseRunner";

export class ActionDictionary {
  static map: Map<string, (...args: any[]) => Generator> = new Map();

  static register<R extends BaseRunner = BaseRunner>(
    name: string,
    genFunc: (this: R, ...args: any[]) => Generator
  ) {
    this.map.set(name, genFunc);
  }

  static get(name: string) {
    return this.map.get(name);
  }
}
