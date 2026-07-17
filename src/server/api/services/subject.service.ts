import { db } from "@/server/db";
import type { StageLevel, Track } from "@/generated/enums";

export interface ListSubjectsInput {
  stageLevel?: StageLevel;
  track?: Track;
  onlyActive?: boolean;
}

// GENERAL applies to both tracks — a class matches a subject when
// subject.track is GENERAL OR equals the class's own track.
export async function listSubjects(input: ListSubjectsInput = {}) {
  return db.subject.findMany({
    where: {
      stageLevel: input.stageLevel,
      ...(input.track !== undefined
        ? { OR: [{ track: "GENERAL" }, { track: input.track }] }
        : {}),
      isActive: input.onlyActive ? true : undefined,
    },
    orderBy: [{ stageLevel: "asc" }, { displayOrder: "asc" }],
  });
}

interface UpsertSubjectInput {
  id?: string;
  name: string;
  stageLevel: StageLevel;
  track: Track;
  maxScore: number;
  minPassingScore: number;
  weeklyBehaviorMax: number;
  weeklyNotebookMax: number;
  weeklyTestMax: number;
  monthlyExamMax: number;
  displayOrder: number;
}

export async function upsertSubject(input: UpsertSubjectInput) {
  const { id, ...data } = input;
  if (id) {
    return db.subject.update({ where: { id }, data });
  }
  return db.subject.create({ data });
}

export async function setSubjectActive(id: string, isActive: boolean) {
  return db.subject.update({ where: { id }, data: { isActive } });
}
