import { db } from "@/server/db";
import type { Role } from "@/generated/enums";

export interface SchoolWideStats {
  scope: "school";
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  roleCounts: { role: Role; count: number }[];
}

export interface TeacherStats {
  scope: "teacher";
  myClasses: number;
  mySubjects: number;
  myStudents: number;
}

export async function getDashboardStats(input: {
  academicYearId: string;
  actor: { id: string; role: Role };
}): Promise<SchoolWideStats | TeacherStats> {
  if (input.actor.role === "TEACHER") {
    const assignments = await db.teacherAssignment.findMany({
      where: { userId: input.actor.id, academicYearId: input.academicYearId },
      select: { classRoomId: true, subjectId: true },
    });
    const classRoomIds = new Set(assignments.map((a) => a.classRoomId));
    const subjectIds = new Set(assignments.map((a) => a.subjectId));

    const myStudents = classRoomIds.size
      ? await db.enrollment.count({
          where: {
            academicYearId: input.academicYearId,
            classRoomId: { in: Array.from(classRoomIds) },
            status: "ACTIVE",
          },
        })
      : 0;

    return { scope: "teacher", myClasses: classRoomIds.size, mySubjects: subjectIds.size, myStudents };
  }

  const [totalStudents, totalTeachers, totalClasses, totalSubjects, roleGroups] = await Promise.all([
    db.enrollment.count({ where: { academicYearId: input.academicYearId, status: "ACTIVE" } }),
    db.user.count({ where: { role: "TEACHER", banned: false } }),
    db.classRoom.count({ where: { academicYearId: input.academicYearId } }),
    db.subject.count({ where: { isActive: true } }),
    db.user.groupBy({ by: ["role"], where: { banned: false }, _count: { role: true } }),
  ]);

  const roleCounts = roleGroups.map((g) => ({ role: g.role, count: g._count.role }));

  return { scope: "school", totalStudents, totalTeachers, totalClasses, totalSubjects, roleCounts };
}
