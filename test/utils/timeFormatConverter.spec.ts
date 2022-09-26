import { convertFormattedTimeToMiliSec, formatMiliSec } from "../../src/utils";

describe("utils/timeFormatConverter/convertFormattedTimeToMiliSec", () => {
  test("Should '10:00:00' be 36000000", () => {
    expect(convertFormattedTimeToMiliSec("10:00:00")).toBe(36000000);
  });
});

describe("utils/timeFormatConverter/formatMiliSec", () => {
  test("[hh:mm:ss] Should 36000000 be '10:00:00'", () => {
    expect(formatMiliSec(36000000, "hh:mm:ss")).toBe("10:00:00");
  });

  test("[mm:ss:ff] Value overflowing: Should 36000000 be '00:00:00' (instead of '600:00:00')", () => {
    expect(formatMiliSec(36000000, "mm:ss:ff")).toBe("00:00:00");
  });
});
