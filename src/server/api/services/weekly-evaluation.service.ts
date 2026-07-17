import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type { Role } from "@/generated/enums";
import { recordAudit } from "./audit.service";
import { assertTeacherOwnsAssignment } from "./teacher-assignment.service";
import { getOpenWeekSlots } from "./week-window.service";

interface ClassSubjectOwnership {
  classRoomId: string;
  subjectId: string;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}

export interface GetGridInput extends ClassSubjectOwnership {
  month: number;
}

// NOTE: staffProcedure alone only proves "some staff member is logged in" —
// it does not prove this specific teacher teaches this specific class and
// subject. Without this check a TEACHER could pass any other class's IDs
// and read grades/student names they have no assignment for.
async function assertCanReadClassSubject(input: ClassSubjectOwnership) {
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

// NOTE: returns a dense grid (every enrolled student × every visible week,
// 1-4) so the client renders a fixed table without guessing which cells are
// missing. TEACHER only ever sees weeks the admin has opened for this
// month; ADMIN/DEVELOPER see all 4 (with openWeeks marking which are
// officially open) since they're allowed to correct closed weeks
// deliberately.
export async function getWeeklyEvaluationGrid(input: GetGridInput) {
  await assertCanReadClassSubject(input);

  const [enrollments, evaluations, subject, openWeekSlots] = await Promise.all([
    db.enrollment.findMany({
      where: { classRoomId: input.classRoomId, academicYearId: input.academicYearId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    }),
    db.weeklyEvaluation.findMany({
      where: {
        classRoomId: input.classRoomId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
        month: input.month,
      },
    }),
    db.subject.findUniqueOrThrow({ where: { id: input.subjectId } }),
    getOpenWeekSlots({ academicYearId: input.academicYearId, month: input.month }),
  ]);

  const scoreMap = new Map<string, (typeof evaluations)[number]>();
  for (const evaluation of evaluations) {
    scoreMap.set(`${evaluation.studentId}:${evaluation.weekInMonth}`, evaluation);
  }

  const allWeeks = [1, 2, 3, 4];
  const weeks = input.actor.role === "TEACHER" ? allWeeks.filter((w) => openWeekSlots.has(w)) : allWeeks;

  return {
    maxima: {
      behavior: subject.weeklyBehaviorMax,
      notebook: subject.weeklyNotebookMax,
      test: subject.weeklyTestMax,
    },
    weeks,
    openWeeks: Array.from(openWeekSlots),
    rows: enrollments.map((e) => ({
      studentId: e.studentId,
      studentName: e.student.fullName,
      studentCode: e.student.studentCode,
      scores: weeks.map((week) => {
        const evaluation = scoreMap.get(`${e.studentId}:${week}`);
        return evaluation
          ? {
              behaviorScore: evaluation.behaviorScore,
              notebookScore: evaluation.notebookScore,
              testScore: evaluation.testScore,
            }
          : null;
      }),
    })),
  };
}

interface UpsertScoreInput extends ClassSubjectOwnership {
  studentId: string;
  month: number;
  weekInMonth: number;
  behaviorScore: number;
  notebookScore: number;
  testScore: number;
}

export async function upsertWeeklyScore(input: UpsertScoreInput) {
  await assertCanReadClassSubject(input);

  if (input.actor.role === "TEACHER") {
    const openWeekSlots = await getOpenWeekSlots({
      academicYearId: input.academicYearId,
      month: input.month,
    });
    if (!openWeekSlots.has(input.weekInMonth)) {
      throw new TRPCError({ code: "FORBIDDEN", message: `الأسبوع ${input.weekInMonth} مغلق للتعديل حالياً` });
    }
  }

  const subject = await db.subject.findUniqueOrThrow({ where: { id: input.subjectId } });

  if (input.behaviorScore < 0 || input.behaviorScore > subject.weeklyBehaviorMax) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `درجة السلوك والمواظبة يجب أن تكون بين 0 و ${subject.weeklyBehaviorMax}`,
    });
  }
  if (input.notebookScore < 0 || input.notebookScore > subject.weeklyNotebookMax) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `درجة الكشكول والواجب يجب أن تكون بين 0 و ${subject.weeklyNotebookMax}`,
    });
  }
  if (input.testScore < 0 || input.testScore > subject.weeklyTestMax) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `درجة التقييم الأسبوعي يجب أن تكون بين 0 و ${subject.weeklyTestMax}`,
    });
  }

  const evaluation = await db.weeklyEvaluation.upsert({
    where: {
      studentId_subjectId_academicYearId_month_weekInMonth: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
        month: input.month,
        weekInMonth: input.weekInMonth,
      },
    },
    create: {
      studentId: input.studentId,
      classRoomId: input.classRoomId,
      subjectId: input.subjectId,
      academicYearId: input.academicYearId,
      month: input.month,
      weekInMonth: input.weekInMonth,
      behaviorScore: input.behaviorScore,
      behaviorMax: subject.weeklyBehaviorMax,
      notebookScore: input.notebookScore,
      notebookMax: subject.weeklyNotebookMax,
      testScore: input.testScore,
      testMax: subject.weeklyTestMax,
      recordedById: input.actor.id,
    },
    update: {
      behaviorScore: input.behaviorScore,
      notebookScore: input.notebookScore,
      testScore: input.testScore,
      recordedById: input.actor.id,
    },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "WEEKLY_EVALUATION",
    entityId: evaluation.id,
    actor: input.actor,
    studentId: input.studentId,
    fieldChanged: `month_${input.month}_week_${input.weekInMonth}`,
    newValue: `${input.behaviorScore}/${input.notebookScore}/${input.testScore}`,
  });

  return evaluation;
}

// NOTE: used for the printable weekly report — pulls every recorded week
// across the whole academic year (not scoped to one month) so the report
// can group results by month itself.
export async function getStudentWeeklyEvaluations(input: {
  studentId: string;
  academicYearId: string;
  actor: { id: string; name: string; role: Role };
}) {
  let teacherSubjectIds: Set<string> | null = null;
  if (input.actor.role === "TEACHER") {
    const enrollment = await db.enrollment.findUnique({
      where: { studentId_academicYearId: { studentId: input.studentId, academicYearId: input.academicYearId } },
    });
    const assignments = enrollment
      ? await db.teacherAssignment.findMany({
          where: { userId: input.actor.id, classRoomId: enrollment.classRoomId, academicYearId: input.academicYearId },
          select: { subjectId: true },
        })
      : [];
    if (assignments.length === 0) {
      throw new TRPCError({ code: "FORBIDDEN", message: "هذا الطالب ليس في أحد فصولك" });
    }
    teacherSubjectIds = new Set(assignments.map((a) => a.subjectId));
  }

  return db.weeklyEvaluation.findMany({
    where: {
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      subjectId: teacherSubjectIds ? { in: Array.from(teacherSubjectIds) } : undefined,
    },
    include: { subject: true },
    orderBy: [{ month: "asc" }, { weekInMonth: "asc" }, { subject: { displayOrder: "asc" } }],
  });
}
