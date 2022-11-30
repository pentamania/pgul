import {
  flipRadianVertical,
  normalizeDegree,
  toRadian,
} from "../../src/math/radianConverter";
const toleratedFloatDigits = 5;

describe("radianConverter#flipRadianVertical", () => {
  test("Basic: deg 0 be deg 180", () => {
    expect(flipRadianVertical(0)).toBeCloseTo(
      toRadian(180),
      toleratedFloatDigits
    );
  });
  test("Basic: deg 45 be deg 135", () => {
    expect(flipRadianVertical(toRadian(45))).toBeCloseTo(
      toRadian(135),
      toleratedFloatDigits
    );
  });
  test("Boundary: deg 90 would not change", () => {
    const val = toRadian(90);
    expect(flipRadianVertical(val)).toBeCloseTo(val, toleratedFloatDigits);
  });
  test("Basic: deg 180 be 0", () => {
    expect(flipRadianVertical(toRadian(180))).toBeCloseTo(
      0,
      toleratedFloatDigits
    );
  });
  test("Basic: deg 225 be deg 315", () => {
    expect(flipRadianVertical(toRadian(225))).toBeCloseTo(
      toRadian(315),
      toleratedFloatDigits
    );
  });

  test("Boundary: deg 270 would not change", () => {
    const val = toRadian(270);
    expect(flipRadianVertical(val)).toBeCloseTo(val, toleratedFloatDigits);
  });

  test("Basic: deg 315 be deg 225", () => {
    expect(flipRadianVertical(toRadian(315))).toBeCloseTo(
      toRadian(225),
      toleratedFloatDigits
    );
  });

  test("Should be normalized: deg 405(45) be deg 135", () => {
    expect(flipRadianVertical(toRadian(405))).toBeCloseTo(
      toRadian(135),
      toleratedFloatDigits
    );
  });

  // Positize
  test("Positizing test: deg -45 to be deg 225", () => {
    expect(flipRadianVertical(toRadian(-45), true)).toBeCloseTo(
      toRadian(225),
      toleratedFloatDigits
    );
  });
  test("No Positizing test: deg -45 to be deg -135", () => {
    expect(flipRadianVertical(toRadian(-45), false)).toBeCloseTo(
      toRadian(-135),
      toleratedFloatDigits
    );
  });
});

describe("radianConverter#normalizeDegree", () => {
  test("Deg 360 to be 0", () => {
    expect(normalizeDegree(360)).toBeCloseTo(0, toleratedFloatDigits);
  });

  test("Deg 270 to be -90", () => {
    expect(normalizeDegree(270)).toBeCloseTo(-90, toleratedFloatDigits);
  });

  test("Deg 540 to be 180", () => {
    expect(normalizeDegree(540)).toBeCloseTo(180, toleratedFloatDigits);
  });
});
