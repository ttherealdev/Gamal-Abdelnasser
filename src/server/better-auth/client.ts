import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/access-control";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  plugins: [adminClient({ ac, roles })],
});

export type Session = typeof authClient.$Infer.Session;
export const { signIn, signOut, useSession } = authClient;
