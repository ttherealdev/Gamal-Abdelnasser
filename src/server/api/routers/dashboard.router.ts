import { z } from "zod";
import { createTRPCRouter, staffProcedure } from "../trpc";
import { getDashboardStats } from "../services/dashboard.service";

export const dashboardRouter = createTRPCRouter({
  stats: staffProcedure
    .input(z.object({ academicYearId: z.string() }))
    .query(({ ctx, input }) => getDashboardStats({ ...input, actor: ctx.user })),
});
