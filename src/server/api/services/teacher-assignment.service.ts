import { db } from "@/server/db";
import type { Role } from "@/generated/enums";
import { recordAudit } from "./audit.service";

export async function listAssignmentsForTeacher(userId: string, academicYearId: string) {
  return db.teacherAssignment.findMany({
    where: { userId, academicYearId },
    include: { classRoom: true, subject: true },
  });
}

export async function listAssignmentsForClass(classRoomId: string, academicYearId: string) {
  return db.teacherAssignment.findMany({
    where: { classRoomId, academicYearId },
    include: { user: { select: { id: true, name: true, email: true } }, subject: true },
  });
}

// NOTE: the single source of truth for "can this teacher touch this
// class+subject" — every grade-writing procedure calls this before writing.
export async function assertTeacherOwnsAssignment(input: {
  userId: string;
  classRoomId: string;
  subjectId: string;
  academicYearId: string;
}) {
  const assignment = await db.teacherAssignment.findUnique({
    where: {
      userId_classRoomId_subjectId_academicYearId: {
        userId: input.userId,
        classRoomId: input.classRoomId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
      },
    },
  });
  return assignment !== null;
}

interface CreateAssignmentInput {
  userId: string;
  classRoomId: string;
  subjectId: string;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}

export async function createAssignment(input: CreateAssignmentInput) {
  const assignment = await db.teacherAssignment.create({
    data: {
      userId: input.userId,
      classRoomId: input.classRoomId,
      subjectId: input.subjectId,
      academicYearId: input.academicYearId,
    },
    include: { classRoom: true, subject: true, user: true },
  });

  await recordAudit({
    action: "CREATE",
    entityType: "TEACHER_ASSIGNMENT",
    entityId: assignment.id,
    actor: input.actor,
    classRoomCode: assignment.classRoom.code,
    note: `${assignment.user.name} → ${assignment.subject.name}`,
  });

  return assignment;
}

export async function removeAssignment(id: string, actor: { id: string; name: string; role: Role }) {
  const assignment = await db.teacherAssignment.delete({
    where: { id },
    include: { classRoom: true, subject: true, user: true },
  });

  await recordAudit({
    action: "DELETE",
    entityType: "TEACHER_ASSIGNMENT",
    entityId: assignment.id,
    actor,
    classRoomCode: assignment.classRoom.code,
    note: `${assignment.user.name} → ${assignment.subject.name}`,
  });

  return assignment;
}
