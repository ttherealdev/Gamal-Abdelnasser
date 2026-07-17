import { z } from "zod";
import { adminProcedure, createTRPCRouter, staffProcedure } from "../trpc";
import {
  createAssignment,
  listAssignmentsForClass,
  listAssignmentsForTeacher,
  removeAssignment,
} from "../services/teacher-assignment.service";

export const teacherAssignmentRouter = createTRPCRouter({
  // NOTE: arbitrary-userId lookup — restricted to admin/developer, since
  // any other authenticated caller (another teacher, a parent) has no
  // legitimate reason to browse a different teacher's assignment list.
  listForTeacher: adminProcedure
    .input(z.object({ userId: z.string(), academicYearId: z.string() }))
    .query(({ input }) => listAssignmentsForTeacher(input.userId, input.academicYearId)),

  listForClass: staffProcedure
    .input(z.object({ classRoomId: z.string(), academicYearId: z.string() }))
    .query(({ input }) => listAssignmentsForClass(input.classRoomId, input.academicYearId)),

  create: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        classRoomId: z.string(),
        subjectId: z.string(),
        academicYearId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => createAssignment({ ...input, actor: ctx.user })),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => removeAssignment(input.id, ctx.user)),
});
