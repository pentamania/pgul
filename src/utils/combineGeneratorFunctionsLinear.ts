import { ContextBindableGeneratorFunction } from "../core/utilTypes";

/**
 * Creates linear-combined GenaratorFunction
 *
 * @example
 * const combinedGen = (()=> {
 *   let count = 0;
 *   return combineGeneratorFunctionsLinear(
 *     function* () {
 *       yield (count += 1);
 *       yield (count += 1);
 *     },
 *     function* () {
 *       yield (count += 2);
 *       yield (count += 2);
 *     }
 *   )();
 * })();
 * console.log(combinedGen.next()); // 1
 * console.log(combinedGen.next()); // 2
 * console.log(combinedGen.next()); // 4
 * console.log(combinedGen.next()); // 6 (generator done)
 * console.log(combinedGen.next()); // 6
 *
 * @this
 * @param genFuncs
 * @returns
 */
export default function combineGeneratorFunctionsLinear<T>(
  this: T,
  ...genFuncs: ContextBindableGeneratorFunction[]
): ContextBindableGeneratorFunction {
  return function* (this: T) {
    let genList: Generator[] = genFuncs.map((gf) => {
      return gf.bind(this)();
    });

    let currentGen = genList.shift();
    while (currentGen) {
      const res = currentGen.next();
      if (!res.done) {
        yield res.value;
      } else {
        currentGen = genList.shift();
        if (!currentGen) return;
        yield currentGen.next().value;
      }
    }
  }.bind(this);
}
