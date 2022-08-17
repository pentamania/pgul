import zeroFillNum from "../../src/utils/zeroFillNum";

describe("utils/zeroFillNum", () => {
  test("Basic: Should param [64, 4] be '0064'", () => {
    const result = zeroFillNum(64, 4);
    const expected = "0064";
    expect(result).toBe(expected);
  });

  test("Basic: Should param [128, 2] be '128'", () => {
    const result = zeroFillNum(128, 2);
    const expected = "128";
    expect(result).toEqual(expected);
  });

  test("String test: Should param ['64', 4] be '0064'", () => {
    const result = zeroFillNum("64", 4);
    const expected = "0064";
    expect(result).toEqual(expected);
  });
});
