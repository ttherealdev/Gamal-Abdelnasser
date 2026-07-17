import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import {
  createStudent,
  getStudentByCode,
  getStudentById,
  listStudents,
  setStudentActive,
  transferStudent,
  updateStudent,
} from "../services/student.service";

const gender = z.enum(["MALE", "FEMALE"]);
const religion = z.enum(["ISLAM", "CHRISTIANITY"]).optional();
const secondLanguage = z.enum(["FRENCH", "GERMAN", "SPANISH"]).optional();

const studentProfileInput = {
  firstName: z.string().min(2),
  fatherName: z.string().min(2),
  grandfatherName: z.string().min(2),
  familyName: z.string().min(2),
  nationalId: z.string().length(14).optional(),
  gender,
  religion,
  secondLanguage,
  birthDate: z.coerce.date().optional(),
  phone: z.string().min(8).optional(),
};

export const studentRouter = createTRPCRouter({
  list: adminProcedure
    .input(
      z.object({
        academicYearId: z.string(),
        classRoomId: z.string().optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(30),
      }),
    )
    .query(({ input }) => listStudents(input)),

  byId: adminProcedure
    .input(z.object({ id: z.string(), academicYearId: z.string() }))
    .query(({ input }) => getStudentById(input.id, input.academicYearId)),

  byCode: adminProcedure
    .input(z.object({ studentCode: z.string(), academicYearId: z.string() }))
    .query(({ input }) => getStudentByCode(input.studentCode, input.academicYearId)),

  create: adminProcedure
    .input(
      z.object({
        studentCode: z.string().min(1),
        classRoomId: z.string(),
        academicYearId: z.string(),
        ...studentProfileInput,
      }),
    )
    .mutation(({ ctx, input }) => createStudent({ ...input, actor: ctx.user })),

  update: adminProcedure
    .input(z.object({ id: z.string(), ...studentProfileInput }))
    .mutation(({ ctx, input }) => updateStudent({ ...input, actor: ctx.user })),

  transfer: adminProcedure
    .input(z.object({ studentId: z.string(), academicYearId: z.string(), toClassRoomId: z.string() }))
    .mutation(({ ctx, input }) => transferStudent({ ...input, actor: ctx.user })),

  setActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(({ ctx, input }) => setStudentActive({ ...input, actor: ctx.user })),
});
