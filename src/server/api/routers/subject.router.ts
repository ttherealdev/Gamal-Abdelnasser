import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import { listSubjects, setSubjectActive, upsertSubject } from "../services/subject.service";

const stageLevel = z.enum(["FIRST_SECONDARY", "SECOND_SECONDARY"]);
const track = z.enum(["SCIENCE", "ARTS", "GENERAL"]);

export const subjectRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        stageLevel: stageLevel.optional(),
        track: track.optional(),
        onlyActive: z.boolean().optional(),
      }),
    )
    .query(({ input }) => listSubjects(input)),

  upsert: adminProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(2),
        stageLevel,
        track,
        maxScore: z.number().int().min(1).max(1000),
        minPassingScore: z.number().int().min(0),
        weeklyBehaviorMax: z.number().int().min(1).max(100),
        weeklyNotebookMax: z.number().int().min(1).max(100),
        weeklyTestMax: z.number().int().min(1).max(100),
        monthlyExamMax: z.number().int().min(1).max(100),
        displayOrder: z.number().int().min(0),
      }),
    )
    .mutation(({ input }) => upsertSubject(input)),

  setActive: adminProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(({ input }) => setSubjectActive(input.id, input.isActive)),
});
