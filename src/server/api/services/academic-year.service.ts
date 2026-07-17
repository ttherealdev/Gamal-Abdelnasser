import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

export async function listAcademicYears() {
  return db.academicYear.findMany({ orderBy: { id: "desc" } });
}

export async function getCurrentAcademicYear() {
  const year = await db.academicYear.findFirst({ where: { isCurrent: true } });
  if (!year) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "لا توجد سنة دراسية مفعّلة حالياً، فعّل سنة من الإعدادات أولاً",
    });
  }
  return year;
}

// NOTE: this is only ever a DEFAULT for pickers — admin can always browse a
// past month via the month picker. Falls back to the real current calendar
// month the very first time, before any admin has explicitly set one.
export function getEffectiveMonth(year: { activeMonth: number | null }): number {
  return year.activeMonth ?? new Date().getMonth() + 1;
}

export async function updateActiveMonth(input: { academicYearId: string; month: number }) {
  return db.academicYear.update({
    where: { id: input.academicYearId },
    data: { activeMonth: input.month },
  });
}

interface CreateAcademicYearInput {
  id: string;
  startsAt: Date;
  endsAt: Date;
}

// NOTE: activating a year deactivates every other year in the same
// transaction — at most one isCurrent=true row can ever exist.
export async function activateAcademicYear(id: string) {
  return db.$transaction(async (tx) => {
    await tx.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });
    return tx.academicYear.update({
      where: { id },
      data: { isCurrent: true },
    });
  });
}

export async function createAcademicYear(input: CreateAcademicYearInput) {
  return db.academicYear.create({ data: input });
}
