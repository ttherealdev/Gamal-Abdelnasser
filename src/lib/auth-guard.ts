import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/server/better-auth";
import type { Role } from "@/generated/enums";
import { defaultRouteForRole } from "@/lib/rbac";

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// NOTE: this is the actual security boundary — call it at the top of every
// protected layout/page. The client-side <RoleGate> only hides UI, it never
// protects data by itself.
export async function requireSession() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(allowed: readonly Role[]) {
  const session = await requireSession();
  const role = session.user.role as Role;
  if (!allowed.includes(role)) {
    redirect(defaultRouteForRole(role));
  }
  return { ...session, role };
}
