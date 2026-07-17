import { z } from "zod";
import { createTRPCRouter, parentProcedure, staffProcedure } from "../trpc";
import {
  getStudentWeeklyEvaluations,
  getWeeklyEvaluationGrid,
  upsertWeeklyScore,
} from "../services/weekly-evaluation.service";
import { getStudentByParentUserId } from "../services/student.service";

const month = z.number().int().min(1).max(12);

export const weeklyEvaluationRouter = createTRPCRouter({
  grid: staffProcedure
    .input(
      z.object({
        classRoomId: z.string(),
        subjectId: z.string(),
        academicYearId: z.string(),
        month,
      }),
    )
    .query(({ ctx, input }) => getWeeklyEvaluationGrid({ ...input, actor: ctx.user })),

  upsertScore: staffProcedure
    .input(
      z.object({
        studentId: z.string(),
        classRoomId: z.string(),
        subjectId: z.string(),
        academicYearId: z.string(),
        month,
        weekInMonth: z.number().int().min(1).max(4),
        behaviorScore: z.number().int().min(0),
        notebookScore: z.number().int().min(0),
        testScore: z.number().int().min(0),
      }),
    )
    .mutation(({ ctx, input }) => upsertWeeklyScore({ ...input, actor: ctx.user })),

  forStudent: staffProcedure
    .input(z.object({ studentId: z.string(), academicYearId: z.string() }))
    .query(({ ctx, input }) => getStudentWeeklyEvaluations({ ...input, actor: ctx.user })),

  forMyChild: parentProcedure
    .input(z.object({ academicYearId: z.string() }))
    .query(async ({ ctx, input }) => {
      const student = await getStudentByParentUserId(ctx.user.id);
      return getStudentWeeklyEvaluations({ studentId: student.id, actor: ctx.user, ...input });
    }),
});
