import { createTRPCRouter } from "./trpc";
import { academicYearRouter } from "./routers/academic-year.router";
import { subjectRouter } from "./routers/subject.router";
import { classRoomRouter } from "./routers/class-room.router";
import { studentRouter } from "./routers/student.router";
import { teacherAssignmentRouter } from "./routers/teacher-assignment.router";
import { weeklyEvaluationRouter } from "./routers/weekly-evaluation.router";
import { examGradeRouter } from "./routers/exam-grade.router";
import { userRouter } from "./routers/user.router";
import { auditRouter } from "./routers/audit.router";
import { dashboardRouter } from "./routers/dashboard.router";
import { weekWindowRouter } from "./routers/week-window.router";
import { monthlyExamRouter } from "./routers/monthly-exam.router";

export const appRouter = createTRPCRouter({
  academicYear: academicYearRouter,
  subject: subjectRouter,
  classRoom: classRoomRouter,
  student: studentRouter,
  teacherAssignment: teacherAssignmentRouter,
  weeklyEvaluation: weeklyEvaluationRouter,
  monthlyExam: monthlyExamRouter,
  examGrade: examGradeRouter,
  user: userRouter,
  audit: auditRouter,
  dashboard: dashboardRouter,
  weekWindow: weekWindowRouter,
});

export type AppRouter = typeof appRouter;
