import { z } from "zod";
import { createTRPCRouter, parentProcedure, staffProcedure } from "../trpc";
import {
  getClassExamSheet,
  getStudentReportCard,
  upsertExamGrade,
} from "../services/exam-grade.service";
import { getStudentByParentUserId } from "../services/student.service";

const examType = z.enum(["MIDTERM", "FINAL"]);

export const examGradeRouter = createTRPCRouter({
  classSheet: staffProcedure
    .input(z.object({ classRoomId: z.string(), academicYearId: z.string(), examType }))
    .query(({ ctx, input }) => getClassExamSheet({ ...input, actor: ctx.user })),

  upsert: staffProcedure
    .input(
      z.object({
        studentId: z.string(),
        subjectId: z.string(),
        classRoomId: z.string(),
        academicYearId: z.string(),
        examType,
        practicalScore: z.number().int().min(0),
        writtenScore: z.number().int().min(0),
      }),
    )
    .mutation(({ ctx, input }) => upsertExamGrade({ ...input, actor: ctx.user })),

  reportCard: staffProcedure
    .input(z.object({ studentId: z.string(), academicYearId: z.string(), examType }))
    .query(({ ctx, input }) => getStudentReportCard({ ...input, actor: ctx.user })),

  myChildReportCard: parentProcedure
    .input(z.object({ academicYearId: z.string(), examType }))
    .query(async ({ ctx, input }) => {
      const student = await getStudentByParentUserId(ctx.user.id);
      return getStudentReportCard({ studentId: student.id, actor: ctx.user, ...input });
    }),
});
