import { z } from "zod";
import { adminProcedure, createTRPCRouter, staffProcedure } from "../trpc";
import {
  createClassRoom,
  getClassRoomById,
  listClassRooms,
  listClassRoomsForTeacher,
} from "../services/class-room.service";

const stageLevel = z.enum(["FIRST_SECONDARY", "SECOND_SECONDARY"]);

export const classRoomRouter = createTRPCRouter({
  list: staffProcedure
    .input(z.object({ academicYearId: z.string(), stageLevel: stageLevel.optional() }))
    .query(({ input }) => listClassRooms(input)),

  byId: staffProcedure.input(z.object({ id: z.string() })).query(({ input }) => getClassRoomById(input.id)),

  listMine: staffProcedure
    .input(z.object({ academicYearId: z.string() }))
    .query(({ ctx, input }) =>
      listClassRoomsForTeacher(ctx.user.id, input.academicYearId),
    ),

  create: adminProcedure
    .input(
      z.object({
        code: z.string().min(1),
        stageLevel,
        track: z.enum(["SCIENCE", "ARTS", "GENERAL"]),
        capacity: z.number().int().min(1).max(80).default(40),
        academicYearId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createClassRoom({ ...input, actor: ctx.user }),
    ),
});
