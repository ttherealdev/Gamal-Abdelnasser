import { describe, expect, it } from "vitest";
import { compareClassCode, sortByClassCode } from "./sort";

describe("compareClassCode", () => {
  it("orders 2/2 before 2/10, unlike a plain string sort", () => {
    expect(compareClassCode("2/2", "2/10")).toBeLessThan(0);
    expect(compareClassCode("2/10", "2/2")).toBeGreaterThan(0);
  });

  it("treats equal codes as equal", () => {
    expect(compareClassCode("1/5", "1/5")).toBe(0);
  });
});

describe("sortByClassCode", () => {
  it("sorts a full class list into human-expected numeric order", () => {
    const classes = ["1/10", "1/2", "1/1", "2/1", "1/16", "2/10", "2/2"].map((code) => ({ code }));
    expect(sortByClassCode(classes).map((c) => c.code)).toEqual([
      "1/1",
      "1/2",
      "1/10",
      "1/16",
      "2/1",
      "2/2",
      "2/10",
    ]);
  });
});
