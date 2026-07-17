import "server-only";
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { db: PrismaClient };

function makePrismaClient(): PrismaClient {
  const log =
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as const)
      : (["error"] as const);

  if (process.env.DATABASE_URL) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    return new PrismaClient({ adapter, log } as any);
  }
  // No DATABASE_URL — client will throw on any DB query (expected in dev without DB)
  return new PrismaClient({ log } as any);
}

export const db = globalForPrisma.db ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
