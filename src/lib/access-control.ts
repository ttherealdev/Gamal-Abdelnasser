import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access";

// NOTE: this file must stay import-safe on the client (no "server-only",
// no db/env imports) — it's shared verbatim between config.ts and client.ts
// so both sides agree on what "ADMIN"/"DEVELOPER"/etc. are allowed to do.
export const ac = createAccessControl(defaultStatements);

// DEVELOPER keeps the full better-auth admin permission set (super-user).
// ADMIN gets a deliberately narrow slice: only the three actions the app's
// own service layer ever calls (createUser, banUser/unbanUser,
// setUserPassword). It must NOT get "set-role", "impersonate", "delete",
// "update", "list", or "get" — those map to better-auth's native
// /api/auth/admin/* endpoints, which are reachable directly over HTTP and
// know nothing about our tRPC-level rules (e.g. "only DEVELOPER creates
// ADMIN", "no one bans a DEVELOPER"). Granting them here would let any
// ADMIN bypass those rules entirely — self-promote via set-role,
// impersonate the developer account, or hard-delete it — no matter how
// carefully user.service.ts is guarded.
export const roles = {
  DEVELOPER: ac.newRole({ ...adminAc.statements }),
  ADMIN: ac.newRole({ user: ["create", "ban", "set-password"] }),
  TEACHER: ac.newRole({ ...userAc.statements }),
  PARENT: ac.newRole({ ...userAc.statements }),
};
