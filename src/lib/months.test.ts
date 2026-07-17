import { describe, expect, it } from "vitest";
import { monthlyExamName, monthName } from "./months";

describe("monthName", () => {
  it("maps every calendar month to its Arabic name", () => {
    expect(monthName(1)).toBe("يناير");
    expect(monthName(10)).toBe("أكتوبر");
    expect(monthName(12)).toBe("ديسمبر");
  });

  it("falls back gracefully for an out-of-range value instead of throwing", () => {
    expect(monthName(13)).toBe("شهر 13");
  });
});

describe("monthlyExamName", () => {
  it("derives the exam name from the month number, never stored as free text", () => {
    expect(monthlyExamName(10)).toBe("اختبار أكتوبر");
  });
});
