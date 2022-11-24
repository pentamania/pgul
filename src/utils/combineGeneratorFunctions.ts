/**
 * 複数のGeneratorFunctionを組み合わせて実行するGeneratorFunctionを返す
 * 具体的には内部で各Generatorを実行するラッパーGeneratorFunctionを生成する
 *
 * 各Generatorの`this`は本メソッドにおける`this`と一緒になる
 * また引数指定した順番にGeneratorは実行される
 *
 * @see https://runstant.com/pentamania/projects/858db919
 * @example
 * function *genFunc1() {
 *   console.log(this.name) // "alice"
 *   yield 3;
 *   yield 2;
 *   yield 1;
 * }
 * function *genFunc2() {
 *   yield "a";
 *   yield "b";
 * }
 *
 * const context = {name: "alice"}
 * const combined = combineGeneratorFunc.bind(context)(genFunc1, genFunc2)
 * const combinedGenertor = combined()
 * combinedGenertor.next() // run gen1 and gen2 simultaniously
 *
 * @param genFuncs as rest paramnter
 */
export default function combineGeneratorFunctions(
  this: any,
  ...genFuncs: GeneratorFunction[]
) {
  return function* (this: any) {
    let genList: (Generator | null)[] = genFuncs.map((gf) => {
      return gf.bind(this)();
    });
    const results: IteratorYieldResult<unknown>[] = [];

    while (genList.length) {
      results.length = 0;

      // 各ジェネレーター実行、終わってない処理だけピックアップ
      genList = genList
        .map((g) => {
          const res = g!.next();
          if (!res.done) {
            results.push(res);
            return g;
          }
          return null;
        })
        .filter((g) => g != null);

      // console.log('genlist', genList);
      if (results.length) {
        yield results;
      } else {
        // ラッパーGeneratorも終了
        return null;
      }
    }

    return null;
  }.bind(this);
}
