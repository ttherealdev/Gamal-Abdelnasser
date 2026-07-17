import { describe, expect, it, vi, beforeEach } from "vitest";

const findUniqueOrThrow = vi.fn();
const upsert = vi.fn();
const auditCreate = vi.fn();
const weekWindowFindMany = vi.fn();
const assertTeacherOwnsAssignment = vi.fn();

vi.mock("@/server/db", () => ({
  db: {
    subject: { findUniqueOrThrow },
    weeklyEvaluation: { upsert },
    auditLog: { create: auditCreate },
    weekWindow: { findMany: weekWindowFindMany },
  },
}));

vi.mock("./teacher-assignment.service", () => ({
  assertTeacherOwnsAssignment,
}));

const { upsertWeeklyScore } = await import("./weekly-evaluation.service");

const baseInput = {
  studentId: "student-1",
  classRoomId: "class-1",
  subjectId: "subject-1",
  academicYearId: "2025-2026",
  month: 10,
  weekInMonth: 3,
  behaviorScore: 8,
  notebookScore: 12,
  testScore: 13,
};

const subjectRow = {
  id: "subject-1",
  weeklyBehaviorMax: 10,
  weeklyNotebookMax: 15,
  weeklyTestMax: 15,
};

describe("upsertWeeklyScore — ownership boundary", () => {
  beforeEach(() => {
    findUniqueOrThrow.mockReset().mockResolvedValue(subjectRow);
    upsert.mockReset().mockResolvedValue({ id: "eval-1" });
    auditCreate.mockReset().mockResolvedValue({});
    // Week 3 open by default so ownership-only tests aren't blocked by the
    // separate week-window check.
    weekWindowFindMany.mockReset().mockResolvedValue([{ weekInMonth: 3 }]);
    assertTeacherOwnsAssignment.mockReset();
  });

  it("rejects a TEACHER who has no matching TeacherAssignment for this class+subject", async () => {
    assertTeacherOwnsAssignment.mockResolvedValue(false);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).rejects.toThrow("أنت غير مسند لهذا الفصل/المادة");

    expect(upsert).not.toHaveBeenCalled();
  });

  it("allows a TEACHER who does have the matching assignment, in an open week", async () => {
    assertTeacherOwnsAssignment.mockResolvedValue(true);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).resolves.toEqual({ id: "eval-1" });

    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("never calls the ownership check for ADMIN/DEVELOPER — they aren't scoped to specific assignments", async () => {
    await upsertWeeklyScore({
      ...baseInput,
      actor: { id: "admin-1", name: "Admin", role: "ADMIN" },
    });

    expect(assertTeacherOwnsAssignment).not.toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("rejects a behavior score above the subject's configured max, even for an owning teacher", async () => {
    assertTeacherOwnsAssignment.mockResolvedValue(true);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        behaviorScore: 20,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).rejects.toThrow("درجة السلوك والمواظبة يجب أن تكون بين 0 و 10");
  });

  it("rejects a notebook score above the subject's configured max", async () => {
    assertTeacherOwnsAssignment.mockResolvedValue(true);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        notebookScore: 30,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).rejects.toThrow("درجة الكشكول والواجب يجب أن تكون بين 0 و 15");
  });

  it("rejects a weekly-test score above the subject's configured max", async () => {
    assertTeacherOwnsAssignment.mockResolvedValue(true);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        testScore: 30,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).rejects.toThrow("درجة التقييم الأسبوعي يجب أن تكون بين 0 و 15");
  });
});

describe("upsertWeeklyScore — week-open boundary", () => {
  beforeEach(() => {
    findUniqueOrThrow.mockReset().mockResolvedValue(subjectRow);
    upsert.mockReset().mockResolvedValue({ id: "eval-1" });
    auditCreate.mockReset().mockResolvedValue({});
    assertTeacherOwnsAssignment.mockReset().mockResolvedValue(true);
  });

  it("rejects a TEACHER writing to a week that isn't open, even with a valid assignment", async () => {
    weekWindowFindMany.mockReset().mockResolvedValue([]); // no open weeks

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).rejects.toThrow("الأسبوع 3 مغلق للتعديل حالياً");

    expect(upsert).not.toHaveBeenCalled();
  });

  it("allows a TEACHER writing to a week that is open", async () => {
    weekWindowFindMany.mockReset().mockResolvedValue([{ weekInMonth: 3 }]);

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).resolves.toEqual({ id: "eval-1" });
  });

  it("allows more than one open week slot at once (admin safety-valve case)", async () => {
    weekWindowFindMany.mockReset().mockResolvedValue([{ weekInMonth: 1 }, { weekInMonth: 2 }])

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        weekInMonth: 2,
        actor: { id: "teacher-1", name: "Teacher", role: "TEACHER" },
      }),
    ).resolves.toEqual({ id: "eval-1" })
  })

  it("never checks week-open state for ADMIN/DEVELOPER — they can correct closed weeks deliberately", async () => {
    weekWindowFindMany.mockReset().mockResolvedValue([]); // nothing open

    await expect(
      upsertWeeklyScore({
        ...baseInput,
        actor: { id: "admin-1", name: "Admin", role: "ADMIN" },
      }),
    ).resolves.toEqual({ id: "eval-1" });

    expect(weekWindowFindMany).not.toHaveBeenCalled();
  });
});
