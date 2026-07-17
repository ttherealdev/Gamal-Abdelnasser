import { db } from "@/server/db";
import type { AuditAction, AuditEntity, Role } from "@/generated/enums";

interface RecordAuditInput {
  action: AuditAction;
  entityType: AuditEntity;
  entityId: string;
  actor: { id: string; name: string; role: Role };
  studentId?: string | null;
  studentName?: string | null;
  classRoomCode?: string | null;
  fieldChanged?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  note?: string | null;
}

export async function recordAudit(input: RecordAuditInput) {
  await db.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.actor.id,
      userName: input.actor.name,
      userRole: input.actor.role,
      studentId: input.studentId ?? null,
      studentName: input.studentName ?? null,
      classRoomCode: input.classRoomCode ?? null,
      fieldChanged: input.fieldChanged ?? null,
      oldValue: input.oldValue ?? null,
      newValue: input.newValue ?? null,
      note: input.note ?? null,
    },
  });
}

export interface ListAuditLogsInput {
  cursor?: string;
  limit: number;
  entityType?: AuditEntity;
  studentId?: string;
}

export async function listAuditLogs(input: ListAuditLogsInput) {
  const logs = await db.auditLog.findMany({
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
    where: {
      entityType: input.entityType,
      studentId: input.studentId,
    },
    orderBy: { timestamp: "desc" },
  });

  let nextCursor: string | undefined;
  if (logs.length > input.limit) {
    const next = logs.pop();
    nextCursor = next?.id;
  }

  return { logs, nextCursor };
}
