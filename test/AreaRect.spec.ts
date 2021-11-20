import { AreaRect } from "../src/AreaRect";

describe("AreaRect#calcLineInterceptPoints", () => {
  describe("Rect coord [0, 0, 100, 200] vs Line y=0.5x+1", () => {
    const rect = new AreaRect(0, 0, 100, 200);
    const crossCoords = rect.calcLineInterceptPoints(0.5, 1);

    test("Should top coord be [-2, 0]", () => {
      expect(crossCoords.top.x).toBe(-2);
      expect(crossCoords.top.y).toBe(0);
    });
    test("Should bottom coord be [398, 200]", () => {
      expect(crossCoords.bottom.x).toBe(398);
      expect(crossCoords.bottom.y).toBe(200);
    });
    test("Should left coord be [0, 1]", () => {
      expect(crossCoords.left.x).toBe(0);
      expect(crossCoords.left.y).toBe(1);
    });
    test("Should right coord be [100, 51]", () => {
      expect(crossCoords.right.x).toBe(100);
      expect(crossCoords.right.y).toBe(51);
    });
  });
});
