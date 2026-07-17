import { z } from "zod";
import { createTRPCRouter, developerProcedure } from "../trpc";
import { listAuditLogs } from "../services/audit.service";

const auditEntity = z.enum([
  "USER",
  "STUDENT",
  "CLASS_ROOM",
  "SUBJECT",
  "ENROLLMENT",
  "TEACHER_ASSIGNMENT",
  "WEEKLY_EVALUATION",
  "EXAM_GRADE",
]);

export const auditRouter = createTRPCRouter({
  list: developerProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(50),
        entityType: auditEntity.optional(),
        studentId: z.string().optional(),
      }),
    )
    .query(({ input }) => listAuditLogs(input)),
});
