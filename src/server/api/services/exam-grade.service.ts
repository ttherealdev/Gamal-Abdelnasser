import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import type { ExamType, Role } from "@/generated/enums";
import { recordAudit } from "./audit.service";
import { assertTeacherOwnsAssignment } from "./teacher-assignment.service";
import { computeGradeLetter } from "@/lib/grading";

export async function getClassExamSheet(input: {
  classRoomId: string;
  academicYearId: string;
  examType: ExamType;
  actor: { id: string; name: string; role: Role };
}) {
  const [enrollments, allSubjects, grades, teacherSubjectIds] = await Promise.all([
    db.enrollment.findMany({
      where: { classRoomId: input.classRoomId, academicYearId: input.academicYearId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    }),
    db.classRoom
      .findUniqueOrThrow({ where: { id: input.classRoomId } })
      .then((classRoom) =>
        db.subject.findMany({
          where: {
            stageLevel: classRoom.stageLevel,
            isActive: true,
            OR: [{ track: "GENERAL" }, { track: classRoom.track }],
          },
          orderBy: { displayOrder: "asc" },
        }),
      ),
    db.examGrade.findMany({
      where: { classRoomId: input.classRoomId, academicYearId: input.academicYearId, examType: input.examType },
    }),
    input.actor.role === "TEACHER"
      ? db.teacherAssignment
          .findMany({
            where: { userId: input.actor.id, classRoomId: input.classRoomId, academicYearId: input.academicYearId },
            select: { subjectId: true },
          })
          .then((rows) => new Set(rows.map((r) => r.subjectId)))
      : null,
  ]);

  // NOTE: a TEACHER only ever sees the subject(s) they're actually assigned
  // to in this class — not the whole class's grade sheet. If they have no
  // assignment here at all, teacherSubjectIds is empty and this reduces to
  // an empty sheet rather than leaking every other subject's grades.
  const subjects = teacherSubjectIds
    ? allSubjects.filter((s) => teacherSubjectIds.has(s.id))
    : allSubjects;

  const gradeMap = new Map<string, (typeof grades)[number]>();
  for (const g of grades) gradeMap.set(`${g.studentId}:${g.subjectId}`, g);

  return {
    subjects,
    rows: enrollments.map((e) => ({
      studentId: e.studentId,
      studentName: e.student.fullName,
      studentCode: e.student.studentCode,
      cells: subjects.map((s) => {
        const grade = gradeMap.get(`${e.studentId}:${s.id}`);
        return {
          subjectId: s.id,
          practicalScore: grade?.practicalScore ?? 0,
          writtenScore: grade?.writtenScore ?? 0,
          totalScore: grade?.totalScore ?? 0,
        };
      }),
    })),
  };
}

interface UpsertExamGradeInput {
  studentId: string;
  subjectId: string;
  classRoomId: string;
  academicYearId: string;
  examType: ExamType;
  practicalScore: number;
  writtenScore: number;
  actor: { id: string; name: string; role: Role };
}

export async function upsertExamGrade(input: UpsertExamGradeInput) {
  if (input.actor.role === "TEACHER") {
    const owns = await assertTeacherOwnsAssignment({
      userId: input.actor.id,
      classRoomId: input.classRoomId,
      subjectId: input.subjectId,
      academicYearId: input.academicYearId,
    });
    if (!owns) throw new TRPCError({ code: "FORBIDDEN", message: "أنت غير مسند لهذا الفصل/المادة" });
  }

  const subject = await db.subject.findUniqueOrThrow({ where: { id: input.subjectId } });
  const totalScore = input.practicalScore + input.writtenScore;
  if (totalScore > subject.maxScore || totalScore < 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `مجموع الدرجة يجب ألا يتجاوز ${subject.maxScore}`,
    });
  }

  const grade = await db.examGrade.upsert({
    where: {
      studentId_subjectId_academicYearId_examType: {
        studentId: input.studentId,
        subjectId: input.subjectId,
        academicYearId: input.academicYearId,
        examType: input.examType,
      },
    },
    create: {
      studentId: input.studentId,
      subjectId: input.subjectId,
      classRoomId: input.classRoomId,
      academicYearId: input.academicYearId,
      examType: input.examType,
      practicalScore: input.practicalScore,
      writtenScore: input.writtenScore,
      totalScore,
      recordedById: input.actor.id,
    },
    update: {
      practicalScore: input.practicalScore,
      writtenScore: input.writtenScore,
      totalScore,
      recordedById: input.actor.id,
    },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "EXAM_GRADE",
    entityId: grade.id,
    actor: input.actor,
    studentId: input.studentId,
    fieldChanged: input.examType,
    newValue: String(totalScore),
  });

  return grade;
}

export async function getStudentReportCard(input: {
  studentId: string;
  academicYearId: string;
  examType: ExamType;
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

  const grades = await db.examGrade.findMany({
    where: {
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      examType: input.examType,
      subjectId: teacherSubjectIds ? { in: Array.from(teacherSubjectIds) } : undefined,
    },
    include: { subject: true },
    orderBy: { subject: { displayOrder: "asc" } },
  });

  const totalScore = grades.reduce((sum, g) => sum + g.totalScore, 0);
  const totalMax = grades.reduce((sum, g) => sum + g.subject.maxScore, 0);

  return {
    grades: grades.map((g) => ({
      subjectName: g.subject.name,
      maxScore: g.subject.maxScore,
      minPassingScore: g.subject.minPassingScore,
      practicalScore: g.practicalScore,
      writtenScore: g.writtenScore,
      totalScore: g.totalScore,
      gradeLetter: computeGradeLetter(g.totalScore, g.subject.maxScore),
    })),
    totalScore,
    totalMax,
    gradeLetter: totalMax > 0 ? computeGradeLetter(totalScore, totalMax) : null,
  };
}
