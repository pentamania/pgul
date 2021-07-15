import periodChunkToDots from "../../src/utils/periodChunkToDots";

describe("utils/periodChunkToDots", () => {
  test("Basic", () => {
    const expected = "…A…B…C";
    const result = periodChunkToDots("...A...B...C");
    expect(result).toEqual(expected);
  });

  test("9p: Should convert to three dots", () => {
    const expected = "………";
    const result = periodChunkToDots(".........");
    expect(result).toEqual(expected);
  });

  test("8p: Should left two peroids", () => {
    const expected = "……..";
    const result = periodChunkToDots("........");
    expect(result).toEqual(expected);
  });
});
