import { describe, expect, it } from "vitest";
import { can, defaultRouteForRole, isStaffRole, ROLE_LABELS, STAFF_ROLES } from "./rbac";
import type { Role } from "@/generated/enums";

const ALL_ROLES: Role[] = ["DEVELOPER", "ADMIN", "TEACHER", "PARENT"];

describe("can()", () => {
  it("gives DEVELOPER every capability, including the audit log", () => {
    const caps = can("DEVELOPER");
    expect(Object.values(caps).every(Boolean)).toBe(true);
  });

  it("gives ADMIN everything except the audit log", () => {
    const caps = can("ADMIN");
    expect(caps.viewAuditLog).toBe(false);
    const { viewAuditLog, ...rest } = caps;
    expect(Object.values(rest).every(Boolean)).toBe(true);
  });

  it("only lets TEACHER edit grades — never manage students/teachers/classes/subjects/audit", () => {
    const caps = can("TEACHER");
    expect(caps.editGrades).toBe(true);
    expect(caps.manageStudents).toBe(false);
    expect(caps.manageTeachers).toBe(false);
    expect(caps.manageClasses).toBe(false);
    expect(caps.manageSubjects).toBe(false);
    expect(caps.viewAllClasses).toBe(false);
    expect(caps.viewAuditLog).toBe(false);
    expect(caps.manageParentAccess).toBe(false);
  });

  it("gives PARENT no dashboard capabilities at all", () => {
    const caps = can("PARENT");
    expect(Object.values(caps).every((v) => v === false)).toBe(true);
  });

  it("never grants viewAuditLog to anyone but DEVELOPER (regression guard)", () => {
    for (const role of ALL_ROLES) {
      if (role === "DEVELOPER") continue;
      expect(can(role).viewAuditLog).toBe(false);
    }
  });
});

describe("isStaffRole / STAFF_ROLES", () => {
  it("classifies TEACHER, ADMIN, DEVELOPER as staff and PARENT as not", () => {
    expect(isStaffRole("TEACHER")).toBe(true);
    expect(isStaffRole("ADMIN")).toBe(true);
    expect(isStaffRole("DEVELOPER")).toBe(true);
    expect(isStaffRole("PARENT")).toBe(false);
  });

  it("STAFF_ROLES has exactly the three staff roles, no more no less", () => {
    expect(new Set(STAFF_ROLES)).toEqual(new Set(["TEACHER", "ADMIN", "DEVELOPER"]));
  });
});

describe("defaultRouteForRole", () => {
  it("sends PARENT to /parent and everyone else to /dashboard", () => {
    expect(defaultRouteForRole("PARENT")).toBe("/parent");
    expect(defaultRouteForRole("TEACHER")).toBe("/dashboard");
    expect(defaultRouteForRole("ADMIN")).toBe("/dashboard");
    expect(defaultRouteForRole("DEVELOPER")).toBe("/dashboard");
  });
});

describe("ROLE_LABELS", () => {
  it("has an Arabic label for every role with no gaps", () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
    }
  });
});
