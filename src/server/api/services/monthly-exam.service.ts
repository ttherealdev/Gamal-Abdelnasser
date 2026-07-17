import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type { Role } from "@/generated/enums";
import { recordAudit } from "./audit.service";
import { assertTeacherOwnsAssignment } from "./teacher-assignment.service";
import { getEffectiveMonth } from "./academic-year.service";

export interface GetMonthlyExamGridInput {
  classRoomId: string;
  subjectId: string;
  academicYearId: string;
  month: number;
  actor: { id: string; name: string; role: Role };
}

async function assertCanAccess(input: GetMonthlyExamGridInput) {
  if (input.actor.role !== "TEACHER") return;
  const owns = await assertTeacherOwnsAssignment({
    userId: input.actor.id,
    classRoomId: input.classRoomId,
    subjectId: input.subjectId,
    academicYearId: input.academicYearId,
  });
  if (!owns) {
    throw new TRPCError({ code: "FORBIDDEN", message: "أنت غير مسند لهذا الفصل/المادة" });
  }
}

export async function getMonthlyExamGrid(input: GetMonthlyExamGridInput) {
  await assertCanAccess(input);

  const [enrollments, exams, subject, academicYear] = await Promise.all([
    db.enrollment.findMany({
      where: {
        classRoomId: input.classRoomId,
        academicYearId: input.academicYearId,
        status: "ACTIVE",
      },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    }),
    db.monthlyExam.findMany({
      where: {
        classRoomId: input.classRoomId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
        month: input.month,
      },
    }),
    db.subject.findUniqueOrThrow({ where: { id: input.subjectId } }),
    db.academicYear.findUniqueOrThrow({
      where: { id: input.academicYearId },
      select: { activeMonth: true },
    }),
  ]);

  const scoreMap = new Map(exams.map((e) => [e.studentId, e.score]));
  const isCurrentMonth = input.month === getEffectiveMonth(academicYear);

  return {
    maxScore: subject.monthlyExamMax,
    // ADMIN/DEVELOPER always see the grid as editable (they can correct a
    // past month deliberately, same convention as the weekly grid);
    // TEACHER can only edit the school's current active month — there's no
    // separate manual open/close switch for this, it just follows whatever
    // month the admin has set as active in Settings → الشهر الحالي.
    isOpen: input.actor.role === "TEACHER" ? isCurrentMonth : true,
    rows: enrollments.map((e) => ({
      studentId: e.studentId,
      studentName: e.student.fullName,
      studentCode: e.student.studentCode,
      score: scoreMap.get(e.studentId) ?? null,
    })),
  };
}

export async function upsertMonthlyExamScore(input: {
  studentId: string;
  classRoomId: string;
  subjectId: string;
  academicYearId: string;
  month: number;
  score: number;
  actor: { id: string; name: string; role: Role };
}) {
  await assertCanAccess(input);

  if (input.actor.role === "TEACHER") {
    const academicYear = await db.academicYear.findUniqueOrThrow({
      where: { id: input.academicYearId },
      select: { activeMonth: true },
    });
    if (input.month !== getEffectiveMonth(academicYear)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "امتحان هذا الشهر مغلق للتعديل حالياً" });
    }
  }

  const subject = await db.subject.findUniqueOrThrow({ where: { id: input.subjectId } });
  if (input.score < 0 || input.score > subject.monthlyExamMax) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `الدرجة يجب أن تكون بين 0 و ${subject.monthlyExamMax}`,
    });
  }

  const exam = await db.monthlyExam.upsert({
    where: {
      studentId_subjectId_academicYearId_month: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
        month: input.month,
      },
    },
    create: {
      studentId: input.studentId,
      classRoomId: input.classRoomId,
      subjectId: input.subjectId,
      academicYearId: input.academicYearId,
      month: input.month,
      score: input.score,
      maxScore: subject.monthlyExamMax,
      recordedById: input.actor.id,
    },
    update: { score: input.score, recordedById: input.actor.id },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "MONTHLY_EXAM",
    entityId: exam.id,
    actor: input.actor,
    studentId: input.studentId,
    fieldChanged: `month_${input.month}_exam`,
    newValue: String(input.score),
  });

  return exam;
}

// NOTE: for the printable weekly/monthly report — every monthly exam this
// student has across the whole year, ownership-scoped the same way as
// getStudentWeeklyEvaluations.
export async function getStudentMonthlyExams(input: {
  studentId: string;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}) {
  let teacherSubjectIds: Set<string> | null = null;
  if (input.actor.role === "TEACHER") {
    const enrollment = await db.enrollment.findUnique({
      where: {
        studentId_academicYearId: {
          studentId: input.studentId,
          academicYearId: input.academicYearId,
        },
      },
    });
    const assignments = enrollment
      ? await db.teacherAssignment.findMany({
          where: {
            userId: input.actor.id,
            classRoomId: enrollment.classRoomId,
            academicYearId: input.academicYearId,
          },
          select: { subjectId: true },
        })
      : [];
    if (assignments.length === 0) {
      throw new TRPCError({ code: "FORBIDDEN", message: "هذا الطالب ليس في أحد فصولك" });
    }
    teacherSubjectIds = new Set(assignments.map((a) => a.subjectId));
  }

  return db.monthlyExam.findMany({
    where: {
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      subjectId: teacherSubjectIds ? { in: Array.from(teacherSubjectIds) } : undefined,
    },
    include: { subject: true },
    orderBy: [{ month: "asc" }, { subject: { displayOrder: "asc" } }],
  });
}
