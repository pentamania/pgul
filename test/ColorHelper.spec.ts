import { HslColorHelper } from "../src/ColorHelper";

describe("HslColorHelper/static:parseRgbString", () => {
  // Shorthand
  const parseRgb = HslColorHelper.parseRgbString;

  describe("'ff0080' to [255, 0, 128]", () => {
    const expected = [255, 0, 128];
    const testedCode = "ff0080";

    test("Basic", () => {
      expect(parseRgb(testedCode)).toEqual(expected);
    });
    test("With hash", () => {
      expect(parseRgb(`#${testedCode}`)).toEqual(expected);
    });
  });
});

describe("HslColorHelper/static:fromRgb", () => {
  describe("For primary-green(r:0,g:255,b:0)", () => {
    const color = HslColorHelper.fromRgb(0, 255, 0);

    test("Should hue be 0.33...(120/360)", () => {
      expect(color.h).toBeCloseTo(120 / 360);
    });

    test("Should saturation be 1.0", () => {
      expect(color.s).toBe(1.0);
    });

    test("Should luminescence be 0.5", () => {
      expect(color.l).toBe(0.5);
    });
  });
});
