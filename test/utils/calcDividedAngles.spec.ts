import calcDividedAngles from "../../src/utils/calcDividedAngles";
import { toRadian as rad } from "../../src/utils/radianConverter";

const toleratedFloatDigits = 5;

describe("utils/calcDividedAngles", () => {
  test("Even div: center=deg90, div=4, range=deg60 to be [deg120, deg100, deg80, deg60] ", () => {
    const result = calcDividedAngles(rad(90), 4, rad(60));
    const expected = [rad(120), rad(100), rad(80), rad(60)];
    result.forEach((v, i) => {
      expect(v).toBeCloseTo(expected[i], toleratedFloatDigits);
    });
  });

  test("Odd div: center=deg90, div=3, range=deg90 to be [deg135, deg90, deg45]", () => {
    const result = calcDividedAngles(rad(90), 3, rad(90));
    const expected = [rad(135), rad(90), rad(45)];
    result.forEach((v, i) => {
      expect(v).toBeCloseTo(expected[i], toleratedFloatDigits);
    });
  });

  test("Oneshot: center=deg90, div=1, range=deg60 to be [deg120]", () => {
    const result = calcDividedAngles(rad(90), 1, rad(60));
    const expected = [rad(120)];
    result.forEach((v, i) => {
      expect(v).toBeCloseTo(expected[i], toleratedFloatDigits);
    });
  });

  test("Wide range: center=deg90, div=4, range=deg240 to be [deg210, deg130, deg50, deg-30]", () => {
    const result = calcDividedAngles(rad(90), 4, rad(240));
    const expected = [rad(210), rad(130), rad(50), rad(-30)];
    result.forEach((v, i) => {
      expect(v).toBeCloseTo(expected[i], toleratedFloatDigits);
    });
  });

  test("Range 360: center=deg90, div=4, range=deg360 to be [deg270, deg180, deg90, deg0]", () => {
    const result = calcDividedAngles(rad(90), 4, rad(360));
    const expected = [rad(270), rad(180), rad(90), rad(0)];
    result.forEach((v, i) => {
      expect(v).toBeCloseTo(expected[i], toleratedFloatDigits);
    });
  });
});
