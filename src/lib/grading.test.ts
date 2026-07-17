import { describe, expect, it } from "vitest";
import { computeGradeLetter, isPassing, scoreTone } from "./grading";

describe("computeGradeLetter", () => {
  it("returns ممتاز at 85% and above", () => {
    expect(computeGradeLetter(85, 100)).toBe("ممتاز");
    expect(computeGradeLetter(100, 100)).toBe("ممتاز");
  });

  it("returns جيد جداً between 75% and 85%", () => {
    expect(computeGradeLetter(75, 100)).toBe("جيد جداً");
    expect(computeGradeLetter(84, 100)).toBe("جيد جداً");
  });

  it("returns جيد between 65% and 75%", () => {
    expect(computeGradeLetter(65, 100)).toBe("جيد");
    expect(computeGradeLetter(74, 100)).toBe("جيد");
  });

  it("returns مقبول between 50% and 65%", () => {
    expect(computeGradeLetter(50, 100)).toBe("مقبول");
    expect(computeGradeLetter(64, 100)).toBe("مقبول");
  });

  it("returns ضعيف below 50%", () => {
    expect(computeGradeLetter(49, 100)).toBe("ضعيف");
    expect(computeGradeLetter(0, 100)).toBe("ضعيف");
  });

  it("scales correctly against a non-100 max (e.g. a combined multi-subject total)", () => {
    // 300/600 = 50% exactly — matches the "الدرجة الصغرى" pass line on the
    // real report cards this schema was modeled on.
    expect(computeGradeLetter(300, 600)).toBe("مقبول");
    expect(computeGradeLetter(299, 600)).toBe("ضعيف");
  });
});

describe("isPassing", () => {
  it("passes at or above the subject's own minimum, not a hardcoded 50", () => {
    expect(isPassing(70, 70)).toBe(true);
    expect(isPassing(69, 70)).toBe(false);
  });

  it("respects a subject-specific higher threshold (e.g. التربية الدينية at 70/100)", () => {
    expect(isPassing(65, 70)).toBe(false);
    expect(isPassing(65, 50)).toBe(true);
  });
});

describe("scoreTone", () => {
  it("returns the green tone at 80% and above", () => {
    expect(scoreTone(80, 100)).toContain("emerald");
  });

  it("returns the amber tone between 50% and 80%", () => {
    expect(scoreTone(50, 100)).toContain("amber");
    expect(scoreTone(79, 100)).toContain("amber");
  });

  it("returns the red tone below 50%", () => {
    expect(scoreTone(49, 100)).toContain("red");
  });

  it("treats a zero maxScore as 0% instead of dividing by zero", () => {
    expect(() => scoreTone(0, 0)).not.toThrow();
    expect(scoreTone(0, 0)).toContain("red");
  });
});
