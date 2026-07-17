import { describe, expect, it, vi, beforeEach } from "vitest";

const findUnique = vi.fn();

vi.mock("@/server/db", () => ({
  db: {
    teacherAssignment: { findUnique },
  },
}));

const { assertTeacherOwnsAssignment } = await import("./teacher-assignment.service");

describe("assertTeacherOwnsAssignment", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("returns true when a matching assignment row exists", async () => {
    findUnique.mockResolvedValue({ id: "assignment-1" });

    const owns = await assertTeacherOwnsAssignment({
      userId: "teacher-1",
      classRoomId: "class-1",
      subjectId: "subject-1",
      academicYearId: "2025-2026",
    });

    expect(owns).toBe(true);
    expect(findUnique).toHaveBeenCalledWith({
      where: {
        userId_classRoomId_subjectId_academicYearId: {
          userId: "teacher-1",
          classRoomId: "class-1",
          subjectId: "subject-1",
          academicYearId: "2025-2026",
        },
      },
    });
  });

  it("returns false — not throws — when no assignment row exists, so callers decide how to react", async () => {
    findUnique.mockResolvedValue(null);

    const owns = await assertTeacherOwnsAssignment({
      userId: "teacher-1",
      classRoomId: "someone-elses-class",
      subjectId: "subject-1",
      academicYearId: "2025-2026",
    });

    expect(owns).toBe(false);
  });
});
