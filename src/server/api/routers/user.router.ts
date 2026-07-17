import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "../trpc";
import {
  createStaffAccount,
  enableParentPortal,
  listStaff,
  resetParentPassword,
  setStaffBanned,
  updateStaffAccount,
} from "../services/user.service";

export const userRouter = createTRPCRouter({
  listStaff: adminProcedure
    .input(z.object({ role: z.enum(["TEACHER", "ADMIN", "DEVELOPER"]).optional(), search: z.string().optional() }))
    .query(({ input }) => listStaff(input)),

  createStaff: adminProcedure
    .input(
      z.object({
        name: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(["TEACHER", "ADMIN"]),
        gender: z.enum(["MALE", "FEMALE"]).optional(),
        phone: z.string().optional(),
        subjectId: z.string().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      // NOTE: only a DEVELOPER may mint another ADMIN account.
      if (input.role === "ADMIN" && ctx.user.role !== "DEVELOPER") {
        throw new TRPCError({ code: "FORBIDDEN", message: "الأدمن فقط يمكنه إنشاء حسابات معلمين" });
      }
      return createStaffAccount({ ...input, actor: ctx.user, headers: ctx.headers });
    }),

  updateStaff: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string().min(3),
        phone: z.string().optional(),
        gender: z.enum(["MALE", "FEMALE"]).optional(),
        subjectId: z.string().nullable().optional(),
      }),
    )
    .mutation(({ ctx, input }) => updateStaffAccount({ ...input, actor: ctx.user })),

  setBanned: adminProcedure
    .input(z.object({ userId: z.string(), banned: z.boolean(), banReason: z.string().optional() }))
    .mutation(({ ctx, input }) => setStaffBanned({ ...input, actor: ctx.user, headers: ctx.headers })),

  enableParentPortal: adminProcedure
    .input(z.object({ studentId: z.string(), password: z.string().min(8) }))
    .mutation(({ ctx, input }) => enableParentPortal({ ...input, actor: ctx.user, headers: ctx.headers })),

  resetParentPassword: adminProcedure
    .input(z.object({ studentId: z.string(), newPassword: z.string().min(8) }))
    .mutation(({ ctx, input }) => resetParentPassword({ ...input, actor: ctx.user, headers: ctx.headers })),
});
