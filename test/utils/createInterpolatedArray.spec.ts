import { createInterpolatedArray } from "../../src/utils/createInterpolatedArray";

describe("utils/createInterpolatedArray", () => {
  test("Basic: Should input '1, 3, 5' return array [1, 2, 3, 4, 5]", () => {
    const recieved = createInterpolatedArray(1, 3, 5);
    const expected = [1, 2, 3, 4, 5];
    expect(recieved).toEqual(expected);
  });

  test("Negative step test: Should input '0, 2, -1' return array [0, 1, 2, 1, 0, -1]", () => {
    const recieved = createInterpolatedArray(0, 2, -1);
    const expected = [0, 1, 2, 1, 0, -1];
    expect(recieved).toEqual(expected);
  });

  test("Skip stone test: Should input '0, 2, 2' return array [0, 1, 2]", () => {
    const recieved = createInterpolatedArray(0, 2, 2);
    const expected = [0, 1, 2];
    expect(recieved).toEqual(expected);
  });
});
