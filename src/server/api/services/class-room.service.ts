import { db } from "@/server/db";
import type { StageLevel, Track } from "@/generated/enums";
import { recordAudit } from "./audit.service";
import type { Role } from "@/generated/enums";

export async function getClassRoomById(id: string) {
  return db.classRoom.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { enrollments: true } } },
  });
}

export interface ListClassRoomsInput {
  academicYearId: string;
  stageLevel?: StageLevel;
}

export async function listClassRooms(input: ListClassRoomsInput) {
  return db.classRoom.findMany({
    where: { academicYearId: input.academicYearId, stageLevel: input.stageLevel },
    include: { _count: { select: { enrollments: true } } },
    orderBy: [{ stageLevel: "asc" }, { code: "asc" }],
  });
}

export async function listClassRoomsForTeacher(
  userId: string,
  academicYearId: string,
) {
  const assignments = await db.teacherAssignment.findMany({
    where: { userId, academicYearId },
    include: { classRoom: true, subject: true },
  });

  const byClass = new Map<
    string,
    { classRoom: (typeof assignments)[number]["classRoom"]; subjects: (typeof assignments)[number]["subject"][] }
  >();

  for (const a of assignments) {
    const entry = byClass.get(a.classRoomId);
    if (entry) entry.subjects.push(a.subject);
    else byClass.set(a.classRoomId, { classRoom: a.classRoom, subjects: [a.subject] });
  }

  return Array.from(byClass.values());
}

interface CreateClassRoomInput {
  code: string;
  stageLevel: StageLevel;
  track: Track;
  capacity: number;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}

export async function createClassRoom(input: CreateClassRoomInput) {
  const classRoom = await db.classRoom.create({
    data: {
      code: input.code,
      stageLevel: input.stageLevel,
      track: input.track,
      capacity: input.capacity,
      academicYearId: input.academicYearId,
    },
  });

  await recordAudit({
    action: "CREATE",
    entityType: "CLASS_ROOM",
    entityId: classRoom.id,
    actor: input.actor,
    classRoomCode: classRoom.code,
  });

  return classRoom;
}
