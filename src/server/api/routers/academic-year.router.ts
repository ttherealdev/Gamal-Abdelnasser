import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import {
  activateAcademicYear,
  createAcademicYear,
  listAcademicYears,
  updateActiveMonth,
} from "../services/academic-year.service";

export const academicYearRouter = createTRPCRouter({
  list: protectedProcedure.query(() => listAcademicYears()),

  create: adminProcedure
    .input(
      z.object({
        id: z.string().regex(/^\d{4}-\d{4}$/, "الصيغة يجب أن تكون 2025-2026"),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
      }),
    )
    .mutation(({ input }) => createAcademicYear(input)),

  activate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => activateAcademicYear(input.id)),

  updateActiveMonth: adminProcedure
    .input(z.object({ academicYearId: z.string(), month: z.number().int().min(1).max(12) }))
    .mutation(({ input }) => updateActiveMonth(input)),
});
