import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import type { Role } from "@/generated/enums";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({ headers: opts.headers });
  return { db, session, headers: opts.headers };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();
  const result = await next();
  if (process.env.NODE_ENV === "development") {
    console.log(`[trpc] ${path} took ${Date.now() - start}ms`);
  }
  return result;
});

const requireSession = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const role = ctx.session.user.role as Role;
  return next({
    ctx: {
      ...ctx,
      user: { ...ctx.session.user, role },
    },
  });
});

export const protectedProcedure = publicProcedure
  .use(timingMiddleware)
  .use(requireSession);

function requireRole(allowed: readonly Role[]) {
  return t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const role = ctx.session.user.role as Role;
    if (!allowed.includes(role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "لا تملك صلاحية الوصول لهذا الإجراء",
      });
    }
    return next({ ctx: { ...ctx, user: { ...ctx.session.user, role }, role } });
  });
}

export const staffProcedure = publicProcedure
  .use(timingMiddleware)
  .use(requireRole(["TEACHER", "ADMIN", "DEVELOPER"]));

export const adminProcedure = publicProcedure
  .use(timingMiddleware)
  .use(requireRole(["ADMIN", "DEVELOPER"]));

export const developerProcedure = publicProcedure
  .use(timingMiddleware)
  .use(requireRole(["DEVELOPER"]));

export const parentProcedure = publicProcedure
  .use(timingMiddleware)
  .use(requireRole(["PARENT"]));
