// NOTE: deliberately does NOT import from "@/server/db" or "@/server/better-auth".
// Both pull in `import "server-only"` (via db.ts) and src/env.ts's strict
// NODE_ENV validation (via the better-auth config), neither of which is set
// up when this script runs standalone via `bun ./scripts/db-seed.ts` —
// only Next's own CLI (dev/build/start) sets those up automatically. A
// local, self-contained PrismaClient + a minimal betterAuth instance (used
// only for its password hasher) sidestep both problems entirely.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as any);

const seedAuth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "seed-script-only-not-for-runtime",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
});

const ACADEMIC_YEAR_ID = "2025-2026";

// NOTE: the 7 core subjects come from the landing page's departments.tsx;
// second-language and CS were added to match the live 2025/2026 report
// cards (see uploaded exam sheets) which the landing copy hadn't caught up to yet.
const FIRST_SECONDARY_SUBJECTS = [
  { name: "اللغة العربية", maxScore: 100, minPassingScore: 50, displayOrder: 1 },
  { name: "اللغة الإنجليزية", maxScore: 100, minPassingScore: 50, displayOrder: 2 },
  { name: "الرياضيات", maxScore: 100, minPassingScore: 50, displayOrder: 3 },
  { name: "العلوم المتكاملة", maxScore: 100, minPassingScore: 50, displayOrder: 4 },
  { name: "التاريخ", maxScore: 100, minPassingScore: 50, displayOrder: 5 },
  { name: "الفلسفة والمنطق", maxScore: 100, minPassingScore: 50, displayOrder: 6 },
  { name: "التربية الدينية", maxScore: 100, minPassingScore: 70, displayOrder: 7 },
  { name: "اللغة الثانية", maxScore: 100, minPassingScore: 50, displayOrder: 8 },
  { name: "البرمجة والذكاء الاصطناعي", maxScore: 100, minPassingScore: 50, displayOrder: 9 },
] as const;

// NOTE: track is "GENERAL" for subjects shared by both tracks, never null —
// see the NOTE on Subject.track in schema.prisma for why.
const SECOND_SECONDARY_SUBJECTS = [
  { name: "اللغة العربية", track: "GENERAL", displayOrder: 1 },
  { name: "اللغة الإنجليزية", track: "GENERAL", displayOrder: 2 },
  { name: "التاريخ", track: "GENERAL", displayOrder: 3 },
  { name: "التربية الدينية", track: "GENERAL", minPassingScore: 70, displayOrder: 4 },
  { name: "الرياضيات", track: "SCIENCE", displayOrder: 5 },
  { name: "الفيزياء", track: "SCIENCE", displayOrder: 6 },
  { name: "الكيمياء", track: "SCIENCE", displayOrder: 7 },
  { name: "الإحصاء", track: "ARTS", displayOrder: 8 },
  { name: "الجغرافيا", track: "ARTS", displayOrder: 9 },
  { name: "الفلسفة والمنطق", track: "ARTS", displayOrder: 10 },
] as const;

async function main() {
  const academicYear = await db.academicYear.upsert({
    where: { id: ACADEMIC_YEAR_ID },
    update: {},
    create: {
      id: ACADEMIC_YEAR_ID,
      startsAt: new Date("2025-09-01"),
      endsAt: new Date("2026-06-30"),
      isCurrent: true,
    },
  });

  for (const subject of FIRST_SECONDARY_SUBJECTS) {
    await db.subject.upsert({
      where: { name_stageLevel_track: { name: subject.name, stageLevel: "FIRST_SECONDARY", track: "GENERAL" } },
      update: {},
      create: { ...subject, stageLevel: "FIRST_SECONDARY", track: "GENERAL" },
    });
  }

  for (const subject of SECOND_SECONDARY_SUBJECTS) {
    const track = subject.track as "SCIENCE" | "ARTS" | "GENERAL";
    await db.subject.upsert({
      where: { name_stageLevel_track: { name: subject.name, stageLevel: "SECOND_SECONDARY", track } },
      update: {},
      create: {
        name: subject.name,
        displayOrder: subject.displayOrder,
        maxScore: 100,
        minPassingScore: "minPassingScore" in subject ? subject.minPassingScore : 50,
        stageLevel: "SECOND_SECONDARY",
        track,
      },
    });
  }

  // NOTE: 2/1–2/8 default to SCIENCE and 2/9–2/14 to ARTS as a starting
  // point — adjust per-class tracks from the classes page once real
  // enrollment numbers for this year are known.
  const classCodes = [
    ...Array.from({ length: 16 }, (_, i) => ({
      code: `1/${i + 1}`,
      stageLevel: "FIRST_SECONDARY" as const,
      track: "GENERAL" as const,
    })),
    ...Array.from({ length: 14 }, (_, i) => ({
      code: `2/${i + 1}`,
      stageLevel: "SECOND_SECONDARY" as const,
      track: i < 8 ? ("SCIENCE" as const) : ("ARTS" as const),
    })),
  ];

  for (const classRoom of classCodes) {
    await db.classRoom.upsert({
      where: { code_academicYearId: { code: classRoom.code, academicYearId: ACADEMIC_YEAR_ID } },
      update: {},
      create: { ...classRoom, academicYearId: ACADEMIC_YEAR_ID },
    });
  }

  const seedActiveMonth = 10; // October — matches startsAt below
  await db.academicYear.update({
    where: { id: ACADEMIC_YEAR_ID },
    data: { activeMonth: seedActiveMonth },
  });

  await db.weekWindow.upsert({
    where: {
      academicYearId_month_weekInMonth: { academicYearId: ACADEMIC_YEAR_ID, month: seedActiveMonth, weekInMonth: 1 },
    },
    update: {},
    create: { academicYearId: ACADEMIC_YEAR_ID, month: seedActiveMonth, weekInMonth: 1, isOpen: true },
  });

  const developerEmail = "developer@school.local";
  const existingDeveloper = await db.user.findUnique({ where: { email: developerEmail } });
  if (!existingDeveloper) {
    const authContext = await seedAuth.$context;
    const passwordHash = await authContext.password.hash("change-me-now-12345");

    const developer = await db.user.create({
      data: {
        name: "المطوّر",
        email: developerEmail,
        emailVerified: true,
        role: "DEVELOPER",
      },
    });

    await db.account.create({
      data: {
        userId: developer.id,
        accountId: developer.id,
        providerId: "credential",
        password: passwordHash,
      },
    });

    console.log(`created developer account: ${developerEmail} / change-me-now-12345`);
  }

  console.log(`seeded academic year ${academicYear.id}, ${classCodes.length} classes, subjects.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
