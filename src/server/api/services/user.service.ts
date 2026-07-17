import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";
import { auth } from "@/server/better-auth";
import type { Gender, Role } from "@/generated/enums";
import { recordAudit } from "./audit.service";

export async function listStaff(input: { role?: Role; search?: string }) {
  return db.user.findMany({
    where: {
      role: input.role ? input.role : { in: ["TEACHER", "ADMIN", "DEVELOPER"] },
      name: input.search ? { contains: input.search, mode: "insensitive" } : undefined,
    },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
}

interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "TEACHER" | "ADMIN">;
  gender?: Gender;
  phone?: string;
  subjectId?: string;
  actor: { id: string; name: string; role: Role };
  headers: Headers;
}

// NOTE: every auth.api.* admin call below forwards the caller's real session
// headers. Without them better-auth treats the call as anonymous and throws
// UNAUTHORIZED — it does NOT implicitly trust server-side callers just
// because there's no HTTP request in front of them. `headers` always comes
// from the tRPC context of an already-adminProcedure-gated request, so this
// is the actual logged-in admin's session being forwarded, not a bypass.
// Only DEVELOPER may create ADMIN accounts — enforced by the router.
export async function createStaffAccount(input: CreateStaffInput) {
  const created = await auth.api.createUser({
    headers: input.headers,
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      data: { gender: input.gender, phone: input.phone, createdById: input.actor.id },
    },
  });

  // subjectId isn't a better-auth additionalField (it's pure business
  // metadata, unrelated to auth), so it's set directly instead of through
  // the createUser data payload.
  if (input.subjectId) {
    await db.user.update({ where: { id: created.user.id }, data: { subjectId: input.subjectId } });
  }

  await recordAudit({
    action: "CREATE",
    entityType: "USER",
    entityId: created.user.id,
    actor: input.actor,
    note: `${input.role}: ${input.name} (${input.email})`,
  });

  return created.user;
}

export async function updateStaffAccount(input: {
  userId: string;
  name: string;
  phone?: string;
  gender?: Gender;
  subjectId?: string | null;
  actor: { id: string; name: string; role: Role };
}) {
  const updated = await db.user.update({
    where: { id: input.userId },
    data: { name: input.name, phone: input.phone, gender: input.gender, subjectId: input.subjectId },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "USER",
    entityId: updated.id,
    actor: input.actor,
    note: `تحديث بيانات ${updated.name}`,
  });

  return updated;
}

export async function setStaffBanned(input: {
  userId: string;
  banned: boolean;
  banReason?: string;
  actor: { id: string; name: string; role: Role };
  headers: Headers;
}) {
  if (input.banned) {
    // Developer accounts are never bannable through this flow — an ADMIN
    // (or anyone else) hitting the endpoint directly can't route around the
    // UI's RoleGate and lock out the developer's own account.
    const target = await db.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { role: true },
    });
    if (target.role === "DEVELOPER") {
      throw new TRPCError({ code: "FORBIDDEN", message: "لا يمكن إيقاف حساب المطوّر" });
    }

    await auth.api.banUser({
      headers: input.headers,
      body: { userId: input.userId, banReason: input.banReason },
    });
  } else {
    await auth.api.unbanUser({ headers: input.headers, body: { userId: input.userId } });
  }

  await recordAudit({
    action: "UPDATE",
    entityType: "USER",
    entityId: input.userId,
    actor: input.actor,
    fieldChanged: "banned",
    newValue: String(input.banned),
  });
}

// Parent portal ---------------------------------------------------------

function parentEmailFor(studentCode: string) {
  return `${studentCode}@parent.school.local`;
}

export async function enableParentPortal(input: {
  studentId: string;
  password: string;
  actor: { id: string; name: string; role: Role };
  headers: Headers;
}) {
  const student = await db.student.findUniqueOrThrow({ where: { id: input.studentId } });
  if (student.parentUserId) {
    throw new TRPCError({ code: "CONFLICT", message: "بوابة ولي الأمر مفعّلة بالفعل لهذا الطالب" });
  }

  const created = await auth.api.createUser({
    headers: input.headers,
    body: {
      name: `ولي أمر ${student.fullName}`,
      email: parentEmailFor(student.studentCode),
      password: input.password,
      role: "PARENT",
      data: { createdById: input.actor.id },
    },
  });

  await db.student.update({
    where: { id: student.id },
    data: { parentUserId: created.user.id },
  });

  await recordAudit({
    action: "CREATE",
    entityType: "USER",
    entityId: created.user.id,
    actor: input.actor,
    studentId: student.id,
    studentName: student.fullName,
    note: "تفعيل بوابة ولي الأمر",
  });

  return created.user;
}

export async function resetParentPassword(input: {
  studentId: string;
  newPassword: string;
  actor: { id: string; name: string; role: Role };
  headers: Headers;
}) {
  const student = await db.student.findUniqueOrThrow({ where: { id: input.studentId } });
  if (!student.parentUserId) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "بوابة ولي الأمر غير مفعّلة" });
  }

  await auth.api.setUserPassword({
    headers: input.headers,
    body: { userId: student.parentUserId, newPassword: input.newPassword },
  });

  await recordAudit({
    action: "UPDATE",
    entityType: "USER",
    entityId: student.parentUserId,
    actor: input.actor,
    studentId: student.id,
    studentName: student.fullName,
    note: "إعادة تعيين كلمة مرور ولي الأمر",
  });
}

export function studentCodeToParentEmail(studentCode: string) {
  return parentEmailFor(studentCode);
}
