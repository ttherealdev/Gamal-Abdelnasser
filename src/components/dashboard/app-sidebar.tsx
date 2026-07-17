"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarCheck,
  FileText,
  History,
  Home,
  UserCog,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/dashboard/nav-user";
import { can } from "@/lib/rbac";
import type { Role } from "@/generated/enums";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  show: (caps: ReturnType<typeof can>) => boolean;
}

const items: NavItem[] = [
  { title: "الرئيسية", href: "/dashboard", icon: Home, show: () => true },
  {
    title: "إدارة المستخدمين",
    href: "/dashboard/users",
    icon: UserCog,
    show: (c) => c.manageStudents || c.manageTeachers,
  },
  {
    title: "الفصول والطلاب",
    href: "/dashboard/classes",
    icon: BookOpen,
    show: (c) => c.manageClasses,
  },
  { title: "الدرجات الأسبوعية", href: "/dashboard/grades", icon: Award, show: (c) => c.editGrades },
  {
    title: "الإعدادات",
    href: "/dashboard/settings",
    icon: CalendarCheck,
    show: (c) => c.manageWeeks,
  },
  { title: "التقارير", href: "/dashboard/reports", icon: FileText, show: (c) => c.manageStudents },
  { title: "سجل النشاط", href: "/dashboard/logs", icon: History, show: (c) => c.viewAuditLog },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  user,
}: {
  user: { id: string; name: string; email: string; role: Role; image?: string | null };
}) {
  const pathname = usePathname();
  const caps = can(user.role);
  const visible = items.filter((item) => item.show(caps));

  return (
    <Sidebar
      variant="floating"
      collapsible="none"
      side="right"
    >
      <SidebarHeader className="p-3">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-lg px-2 py-2"
        >
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            <span className="text-base font-bold text-primary-foreground">ج</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold">مدرسة جمال عبدالناصر</span>
            <span className="truncate text-xs text-muted-foreground">لوحة التحكم</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-muted-foreground/70 uppercase">
            القائمة
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visible.map((item) => {
                const isActive = isNavItemActive(pathname, item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-10 rounded-lg text-sm data-[active=true]:bg-primary data-[active=true]:font-medium data-[active=true]:text-primary-foreground data-[active=true]:shadow-md"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4.5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <NavUser user={user} />
    </Sidebar>
  );
}
