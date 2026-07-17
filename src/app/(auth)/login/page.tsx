import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth-guard"
import { defaultRouteForRole } from "@/lib/rbac"
import type { Role } from "@/generated/enums"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  const session = await getSession()
  if (session?.user) {
    redirect(defaultRouteForRole(session.user.role as Role))
  }

  return <LoginForm />
}
