"use client";

import type { ReactNode } from "react";
import { useSession } from "@/server/better-auth/client";
import type { Role } from "@/generated/enums";

interface RoleGateProps {
  allow: readonly Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

// NOTE: purely presentational — every mutation this hides is re-checked by
// the matching tRPC procedure (adminProcedure/staffProcedure/...) regardless.
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { data } = useSession();
  const role = data?.user.role as Role | undefined;
  if (!role || !allow.includes(role)) return fallback;
  return children;
}
