import type { Role } from "@/generated/enums";

export const ROLE_LABELS: Record<Role, string> = {
  DEVELOPER: "مطوّر",
  ADMIN: "أدمن",
  TEACHER: "معلم",
  PARENT: "ولي أمر",
};

export interface Capabilities {
  viewDashboard: boolean;
  manageStudents: boolean;
  manageTeachers: boolean;
  manageClasses: boolean;
  manageSubjects: boolean;
  editGrades: boolean;
  viewAllClasses: boolean;
  viewAuditLog: boolean;
  manageParentAccess: boolean;
  manageWeeks: boolean;
  manageExams: boolean;
}

const CAPABILITIES: Record<Role, Capabilities> = {
  DEVELOPER: {
    viewDashboard: true,
    manageStudents: true,
    manageTeachers: true,
    manageClasses: true,
    manageSubjects: true,
    editGrades: true,
    viewAllClasses: true,
    viewAuditLog: true,
    manageParentAccess: true,
    manageWeeks: true,
    manageExams: true,
  },
  ADMIN: {
    viewDashboard: true,
    manageStudents: true,
    manageTeachers: true,
    manageClasses: true,
    manageSubjects: true,
    editGrades: true,
    viewAllClasses: true,
    viewAuditLog: false,
    manageParentAccess: true,
    manageWeeks: true,
    manageExams: true,
  },
  TEACHER: {
    viewDashboard: true,
    manageStudents: false,
    manageTeachers: false,
    manageClasses: false,
    manageSubjects: false,
    editGrades: true,
    viewAllClasses: false,
    viewAuditLog: false,
    manageParentAccess: false,
    manageWeeks: false,
    manageExams: false,
  },
  PARENT: {
    viewDashboard: false,
    manageStudents: false,
    manageTeachers: false,
    manageClasses: false,
    manageSubjects: false,
    editGrades: false,
    viewAllClasses: false,
    viewAuditLog: false,
    manageParentAccess: false,
    manageWeeks: false,
    manageExams: false,
  },
};

export function can(role: Role): Capabilities {
  return CAPABILITIES[role];
}

export const STAFF_ROLES = ["DEVELOPER", "ADMIN", "TEACHER"] as const satisfies readonly Role[];

export function isStaffRole(role: Role): role is (typeof STAFF_ROLES)[number] {
  return (STAFF_ROLES as readonly Role[]).includes(role);
}

export function defaultRouteForRole(role: Role): string {
  if (role === "PARENT") return "/parent";
  return "/dashboard";
}
