"use client"

import { useRouter } from "next/navigation"
import { ChevronsUpDown, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { signOut } from "@/server/better-auth/client"
import { ROLE_LABELS } from "@/lib/rbac"
import type { Role } from "@/generated/enums"

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("")
}

export function NavUser({
  user,
}: {
  user: { name: string; email: string; role: Role }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                <Avatar className="ring-primary/30 size-8 rounded-lg ring-2">
                  <AvatarFallback className="from-primary via-primary/90 to-primary/70 text-primary-foreground rounded-lg bg-linear-to-br font-bold">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ms-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={isMobile ? "bottom" : "top"}
              align="end"
              className="w-64"
            >
              <DropdownMenuLabel className="flex items-center justify-between font-normal">
                <span className="truncate">{user.name}</span>
                <Badge variant="secondary">{ROLE_LABELS[user.role]}</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={async () => {
                  await signOut()
                  router.replace("/login")
                }}
              >
                <LogOut />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
