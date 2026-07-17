import { z } from "zod";
import { createTRPCRouter, parentProcedure, staffProcedure } from "../trpc";
import {
  getMonthlyExamGrid,
  getStudentMonthlyExams,
  upsertMonthlyExamScore,
} from "../services/monthly-exam.service";
import { getStudentByParentUserId } from "../services/student.service";

const month = z.number().int().min(1).max(12);

export const monthlyExamRouter = createTRPCRouter({
  grid: staffProcedure
    .input(z.object({ classRoomId: z.string(), subjectId: z.string(), academicYearId: z.string(), month }))
    .query(({ ctx, input }) => getMonthlyExamGrid({ ...input, actor: ctx.user })),

  upsertScore: staffProcedure
    .input(
      z.object({
        studentId: z.string(),
        classRoomId: z.string(),
        subjectId: z.string(),
        academicYearId: z.string(),
        month,
        score: z.number().int().min(0),
      }),
    )
    .mutation(({ ctx, input }) => upsertMonthlyExamScore({ ...input, actor: ctx.user })),

  forStudent: staffProcedure
    .input(z.object({ studentId: z.string(), academicYearId: z.string() }))
    .query(({ ctx, input }) => getStudentMonthlyExams({ ...input, actor: ctx.user })),

  forMyChild: parentProcedure
    .input(z.object({ academicYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      const student = await getStudentByParentUserId(ctx.user.id);
      return getStudentMonthlyExams({ studentId: student.id, actor: ctx.user, ...input });
    }),
});
