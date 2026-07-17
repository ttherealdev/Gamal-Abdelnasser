import { requireRole } from "@/lib/auth-guard"
import { ParentHeader } from "./parent-header"
import { PageTransition } from "@/components/dashboard/page-transition"

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole(["PARENT"])

  return (
    <div className="flex min-h-full flex-col">
      <ParentHeader userName={user.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 p-4">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
