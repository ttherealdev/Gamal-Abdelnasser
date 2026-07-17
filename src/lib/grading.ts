export function computeGradeLetter(totalScore: number, maxScore: number): string {
  const pct = (totalScore / maxScore) * 100;
  if (pct >= 85) return "ممتاز";
  if (pct >= 75) return "جيد جداً";
  if (pct >= 65) return "جيد";
  if (pct >= 50) return "مقبول";
  return "ضعيف";
}

export function isPassing(totalScore: number, minPassingScore: number): boolean {
  return totalScore >= minPassingScore;
}

// NOTE: shared so every grade table (weekly grid, exam sheet, reports) uses
// the exact same green/amber/red thresholds instead of each re-inventing them.
export function scoreTone(totalScore: number, maxScore: number): string {
  const pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  if (pct >= 80) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
  if (pct >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
}
