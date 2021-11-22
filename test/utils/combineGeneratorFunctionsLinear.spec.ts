import combineGeneratorFunctionsLinear from "../../src/utils/combineGeneratorFunctionsLinear";

describe("utils/combineGeneratorFunctionsLinear", () => {
  test("Basic", () => {
    let count = 0;
    const combinedFunc = combineGeneratorFunctionsLinear(
      function* () {
        yield (count += 1);
        yield (count += 1);
      },
      function* () {
        yield (count += 2);
        yield (count += 2);
        yield (count += 2);
      }
    );

    const combinedGen = combinedFunc();
    combinedGen.next();
    combinedGen.next();
    combinedGen.next();
    combinedGen.next();
    combinedGen.next(); // Done
    combinedGen.next(); // Nothing happens

    expect(count).toBe(8);
  });

  test("Should be dead", () => {
    const combinedGen = combineGeneratorFunctionsLinear(
      function* () {
        yield 1;
      },
      function* () {
        yield 2;
        yield 3;
      }
    )();
    combinedGen.next();
    combinedGen.next();
    combinedGen.next();

    expect(combinedGen.next().done).toBe(true);
  });

  test("'this' binded", () => {
    interface OneDim {
      x: number;
    }
    const obj: OneDim = { x: 0 };
    const combineFunc = combineGeneratorFunctionsLinear.bind(obj);
    const combinedGen = combineFunc(
      function* () {
        this.x += 1;
      },
      function* () {
        this.x += 3;
      }
    )();

    combinedGen.next();
    combinedGen.next();

    expect(obj.x).toBe(4);
  });
});
