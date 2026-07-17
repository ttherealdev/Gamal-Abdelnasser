import { z } from "zod";
import { adminProcedure, createTRPCRouter, staffProcedure } from "../trpc";
import { listWeekWindows, setWeekOpen } from "../services/week-window.service";

export const weekWindowRouter = createTRPCRouter({
  list: staffProcedure
    .input(z.object({ academicYearId: z.string(), month: z.number().int().min(1).max(12) }))
    .query(({ input }) => listWeekWindows(input)),

  setOpen: adminProcedure
    .input(
      z.object({
        academicYearId: z.string(),
        month: z.number().int().min(1).max(12),
        weekInMonth: z.number().int().min(1).max(4),
        isOpen: z.boolean(),
      }),
    )
    .mutation(({ input }) => setWeekOpen(input)),
});
