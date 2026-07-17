// Class codes look like "2/10" — a plain string sort puts that right after
// "2/1" and before "2/2". Splitting on "/" and comparing each part
// numerically gives the order a human actually expects.
export function compareClassCode(a: string, b: string): number {
  const partsA = a.split("/").map(Number);
  const partsB = b.split("/").map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const diff = (partsA[i] ?? 0) - (partsB[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function sortByClassCode<T extends { code: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => compareClassCode(a.code, b.code));
}
