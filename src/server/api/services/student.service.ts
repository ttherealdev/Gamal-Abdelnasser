import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type {
  Gender,
  Religion,
  Role,
  SecondLanguage,
} from "@/generated/enums";
import { recordAudit } from "./audit.service";

function buildFullName(parts: {
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
}) {
  return [parts.firstName, parts.fatherName, parts.grandfatherName, parts.familyName]
    .map((p) => p.trim())
    .join(" ");
}

export interface ListStudentsInput {
  academicYearId: string;
  classRoomId?: string;
  search?: string;
  cursor?: string;
  limit: number;
}

export async function listStudents(input: ListStudentsInput) {
  const students = await db.student.findMany({
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    where: {
      isActive: true,
      OR: input.search
        ? [
            { fullName: { contains: input.search, mode: "insensitive" } },
            { studentCode: { contains: input.search, mode: "insensitive" } },
          ]
        : undefined,
      enrollments: {
        some: {
          academicYearId: input.academicYearId,
          classRoomId: input.classRoomId,
          status: "ACTIVE",
        },
      },
    },
    include: {
      enrollments: {
        where: { academicYearId: input.academicYearId },
        include: { classRoom: true },
        take: 1,
      },
    },
    orderBy: { fullName: "asc" },
  });

  let nextCursor: string | undefined;
  if (students.length > input.limit) {
    const next = students.pop();
    nextCursor = next?.id;
  }

  return { students, nextCursor };
}

export async function getStudentById(id: string, academicYearId: string) {
  const student = await db.student.findUnique({
    where: { id },
    include: {
      enrollments: { where: { academicYearId }, include: { classRoom: true } },
      parentUser: { select: { id: true, email: true, banned: true } },
    },
  });
  if (!student) throw new TRPCError({ code: "NOT_FOUND" });
  return student;
}

export async function getStudentByCode(studentCode: string, academicYearId: string) {
  const student = await db.student.findUnique({
    where: { studentCode },
    include: {
      enrollments: { where: { academicYearId }, include: { classRoom: true } },
    },
  });
  if (!student || !student.enrollments[0]) {
    throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد طالب بهذا الكود في السنة الدراسية الحالية" });
  }
  return student;
}

interface CreateStudentInput {
  studentCode: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
  nationalId?: string;
  gender: Gender;
  religion?: Religion;
  secondLanguage?: SecondLanguage;
  birthDate?: Date;
  phone?: string;
  classRoomId: string;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}

export async function createStudent(input: CreateStudentInput) {
  const fullName = buildFullName(input);

  const student = await db.$transaction(async (tx) => {
    const created = await tx.student.create({
      data: {
        studentCode: input.studentCode,
        firstName: input.firstName,
        fatherName: input.fatherName,
        grandfatherName: input.grandfatherName,
        familyName: input.familyName,
        fullName,
        nationalId: input.nationalId,
        gender: input.gender,
        religion: input.religion,
        secondLanguage: input.secondLanguage,
        birthDate: input.birthDate,
        phone: input.phone,
        createdById: input.actor.id,
      },
    });

    await tx.enrollment.create({
      data: {
        studentId: created.id,
        classRoomId: input.classRoomId,
        academicYearId: input.academicYearId,
      },
    });

    return created;
  });

  await recordAudit({
    action: "CREATE",
    entityType: "STUDENT",
    entityId: student.id,
    actor: input.actor,
    studentId: student.id,
    studentName: student.fullName,
  });

  return student;
}

interface UpdateStudentInput {
  id: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
  nationalId?: string;
  gender: Gender;
  religion?: Religion;
  secondLanguage?: SecondLanguage;
  birthDate?: Date;
  phone?: string;
  actor: { id: string; name: string; role: Role };
}

export async function updateStudent(input: UpdateStudentInput) {
  const before = await db.student.findUniqueOrThrow({ where: { id: input.id } });
  const fullName = buildFullName(input);

  const student = await db.student.update({
    where: { id: input.id },
    data: {
      firstName: input.firstName,
      fatherName: input.fatherName,
      grandfatherName: input.grandfatherName,
      familyName: input.familyName,
      fullName,
      nationalId: input.nationalId,
      gender: input.gender,
      religion: input.religion,
      secondLanguage: input.secondLanguage,
      birthDate: input.birthDate,
      phone: input.phone,
    },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "STUDENT",
    entityId: student.id,
    actor: input.actor,
    studentId: student.id,
    studentName: student.fullName,
    fieldChanged: "profile",
    oldValue: before.fullName,
    newValue: student.fullName,
  });

  return student;
}

export async function transferStudent(input: {
  studentId: string;
  academicYearId: string;
  toClassRoomId: string;
  actor: { id: string; name: string; role: Role };
}) {
  const enrollment = await db.enrollment.findUnique({
    where: { studentId_academicYearId: { studentId: input.studentId, academicYearId: input.academicYearId } },
    include: { classRoom: true },
  });
  if (!enrollment) throw new TRPCError({ code: "NOT_FOUND", message: "الطالب غير مسجل في هذه السنة" });

  const updated = await db.enrollment.update({
    where: { id: enrollment.id },
    data: { classRoomId: input.toClassRoomId },
    include: { classRoom: true },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "ENROLLMENT",
    entityId: updated.id,
    actor: input.actor,
    studentId: input.studentId,
    fieldChanged: "classRoomId",
    oldValue: enrollment.classRoom.code,
    newValue: updated.classRoom.code,
  });

  return updated;
}

export async function getStudentByParentUserId(parentUserId: string) {
  const student = await db.student.findUnique({ where: { parentUserId } });
  if (!student) throw new TRPCError({ code: "NOT_FOUND", message: "لا يوجد طالب مرتبط بهذا الحساب" });
  return student;
}

export async function setStudentActive(input: {
  id: string;
  isActive: boolean;
  actor: { id: string; name: string; role: Role };
}) {
  const student = await db.student.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "STUDENT",
    entityId: student.id,
    actor: input.actor,
    studentId: student.id,
    studentName: student.fullName,
    fieldChanged: "isActive",
    newValue: String(input.isActive),
  });

  return student;
}
