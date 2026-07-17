import { db } from "@/server/db";

export interface ListWeekWindowsInput {
  academicYearId: string;
  month: number;
}

// NOTE: always exactly 4 slots (a month = 4 weeks) — returns a dense list
// (defaulting closed) so the admin UI always shows all 4 even before any
// row has ever been created for this month.
export async function listWeekWindows(input: ListWeekWindowsInput) {
  const rows = await db.weekWindow.findMany({
    where: { academicYearId: input.academicYearId, month: input.month },
  });
  const openMap = new Map(rows.map((r) => [r.weekInMonth, r.isOpen]));

  return Array.from({ length: 4 }, (_, i) => {
    const weekInMonth = i + 1;
    return { weekInMonth, isOpen: openMap.get(weekInMonth) ?? false };
  });
}

export async function getOpenWeekSlots(input: { academicYearId: string; month: number }): Promise<Set<number>> {
  const rows = await db.weekWindow.findMany({
    where: { academicYearId: input.academicYearId, month: input.month, isOpen: true },
    select: { weekInMonth: true },
  });
  return new Set(rows.map((r) => r.weekInMonth));
}

export async function setWeekOpen(input: {
  academicYearId: string;
  month: number;
  weekInMonth: number;
  isOpen: boolean;
}) {
  return db.weekWindow.upsert({
    where: {
      academicYearId_month_weekInMonth: {
        academicYearId: input.academicYearId,
        month: input.month,
        weekInMonth: input.weekInMonth,
      },
    },
    create: { ...input },
    update: { isOpen: input.isOpen },
  });
}
