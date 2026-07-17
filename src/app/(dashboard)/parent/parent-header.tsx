"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/server/better-auth/client"

export function ParentHeader({ userName }: { userName: string }) {
  const router = useRouter()

  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <p className="text-sm font-semibold">بوابة ولي الأمر</p>
        <p className="text-muted-foreground text-xs">{userName}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={async () => {
          await signOut()
          router.replace("/login")
        }}
      >
        <LogOut />
        خروج
      </Button>
    </header>
  )
}
