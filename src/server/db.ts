import "server-only";
import { PrismaClient } from "../generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { db: PrismaClient };

function makePrismaClient(): PrismaClient {
  const log =
    process.env.NODE_ENV === "development"
      ? (["query", "error", "warn"] as const)
      : (["error"] as const);

  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  });
  return new PrismaClient({ adapter, log } as any);
}

export const db = globalForPrisma.db ?? makePrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
