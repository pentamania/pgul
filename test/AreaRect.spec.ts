import { AreaRect } from "../src/AreaRect";
type Coord = [number, number];

describe("AreaRect: Test bounds", () => {
  const rect = new AreaRect(0, 0, 100, 200);
  let coord: Coord;

  // Out of Bound
  test("Should coord [50, 50] not be out of bound", () => {
    coord = [50, 50];
    expect(rect.outOfRect(...coord)).toBe(false);
  });
  test("Boundary test: Should coord [100, 200] not be out of bound", () => {
    coord = [100, 200];
    expect(rect.outOfRect(...coord)).toBe(false);
  });
  test("Should coord [-2, 0] be out of bound", () => {
    coord = [-2, 0];
    expect(rect.outOfRect(...coord)).toBe(true);
  });

  // Within Bound
  test("Should coord [50, 50] be within bound", () => {
    coord = [50, 50];
    expect(rect.withinBound(...coord)).toBe(true);
  });
  test("Boundary test: Should coord [100, 200] be within bound", () => {
    coord = [100, 200];
    expect(rect.withinBound(...coord)).toBe(true);
  });
  test("Should coord [-2, 0] not be within bound", () => {
    coord = [-2, 0];
    expect(rect.withinBound(...coord)).toBe(false);
  });
});

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
