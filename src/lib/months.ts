export const MONTH_NAMES: Record<number, string> = {
  1: "يناير",
  2: "فبراير",
  3: "مارس",
  4: "أبريل",
  5: "مايو",
  6: "يونيو",
  7: "يوليو",
  8: "أغسطس",
  9: "سبتمبر",
  10: "أكتوبر",
  11: "نوفمبر",
  12: "ديسمبر",
};

export function monthName(month: number): string {
  return MONTH_NAMES[month] ?? `شهر ${month}`;
}

export function monthlyExamName(month: number): string {
  return `اختبار ${monthName(month)}`;
}
