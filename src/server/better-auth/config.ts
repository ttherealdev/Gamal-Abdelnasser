import { betterAuth } from "better-auth";
import { env } from "@/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/server/db";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { ac, roles } from "@/lib/access-control";

const vercelOrigin = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : null;

// NOTE: `role` itself is owned by the admin plugin (not redeclared under
// user.additionalFields). ac/roles (from lib/access-control) teach the
// plugin that "DEVELOPER"/"ADMIN"/"TEACHER"/"PARENT" are real roles — without
// them, adminRoles below fails validation at startup. Public self sign-up is
// fully disabled — every account is created server side through
// userService, gated by our own adminProcedure.
export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: [
    "http://localhost:3000",
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
    ...(vercelOrigin ? [vercelOrigin] : []),
  ],
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },

  user: {
    additionalFields: {
      gender: { type: "string", required: false, input: false },
      phone: { type: "string", required: false, input: false },
      createdById: { type: "string", required: false, input: false },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 14,
    // cookieCache trades a DB hit for a 5-minute-stale session. In a school
    // admin panel, an ADMIN banning a misbehaving TEACHER (or someone
    // unbanning themselves after a mistake) needs that to take effect on the
    // very next request — not up to 5 minutes later. Traffic here is modest
    // (a single school's staff), so the extra DB round-trip per request is
    // the right trade-off over a stale-session window.
    cookieCache: { enabled: false },
  },

  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "TEACHER",
      adminRoles: ["ADMIN", "DEVELOPER"],
      bannedUserMessage: "تم إيقاف هذا الحساب، تواصل مع إدارة المدرسة.",
    }),
    nextCookies(),
  ],

  onAPIError: {
    onError(error, ctx) {
      console.error("BETTER AUTH API ERROR", error, ctx);
    },
  },
});

export type Auth = typeof auth;
