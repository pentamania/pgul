import { DEG_TO_RAD_TABLE } from "../../src/math/radianConverter";
import { Runner2D } from "../../src/runner/Runner2D";

describe("Runner2D#setVector", () => {
  test("Should [1,1] vector return PI/4 radian (45 deg)", () => {
    const rnr = new Runner2D();
    rnr.setVector(1, 1);
    expect(rnr.getDirectionByRadian()).toBeCloseTo(Math.PI / 4);
  });

  test("Should [1,1] vector speed set to sqrt2", () => {
    const rnr = new Runner2D();
    rnr.setVector(1, 1);
    expect(rnr.speed).toBeCloseTo(Math.sqrt(2));
  });
});

describe("Runner2D#getDirection", () => {
  test("Should [1,1] vector return 45 deg", () => {
    const rnr = new Runner2D();
    rnr.setVector(1, 1);
    expect(rnr.getDirection()).toBeCloseTo(45);
  });
});

describe("Runner2D#setVectorAngle", () => {
  const sampleRadVal = Math.PI;

  test("Should getDirectionByRadian return same value set by setVectorAngle", () => {
    const rnr = new Runner2D();
    rnr.setVectorAngle(sampleRadVal);
    expect(rnr.getDirectionByRadian()).toBeCloseTo(sampleRadVal);
  });

  test("Should vectorAngle getter return same value set by setVectorAngle", () => {
    const rnr = new Runner2D();
    rnr.setVectorAngle(sampleRadVal);
    expect(rnr.vectorAngle).toBeCloseTo(sampleRadVal);
  });

  test("Should speed not be changed", () => {
    const sampleSpeedVal = 3;

    const rnr = new Runner2D();
    rnr.setSpeed(sampleSpeedVal);
    rnr.setVectorAngle(sampleRadVal);
    expect(rnr.speed).toBe(sampleSpeedVal);
  });
});

describe("Runner2D#rotateVector", () => {
  test("Should [1,1] vector rotate 45 deg return Math.PI/2 (90 deg)", () => {
    const rnr = new Runner2D();
    rnr.setVector(1, 1);
    rnr.rotateVector(DEG_TO_RAD_TABLE[45]);
    expect(rnr.getDirection()).toBeCloseTo(90);
  });
});

describe("Runner2D#setSpeed", () => {
  test("Should vector length updated after setSpeed", () => {
    const sampleSpeed = 5.5;
    const rnr = new Runner2D();
    rnr.setVector(1, 1);
    rnr.setSpeed(sampleSpeed);
    expect(rnr.getVector().length).toBeCloseTo(sampleSpeed);
  });
});
