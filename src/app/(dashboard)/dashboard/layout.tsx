import { requireRole } from "@/lib/auth-guard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { PageTransition } from "@/components/dashboard/page-transition";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role } = await requireRole(["TEACHER", "ADMIN", "DEVELOPER"]);

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          role,
          image: user.image,
        }}
      />
      <SidebarInset className="bg-[linear-gradient(to_right,oklch(0.5_0.18_250/0.025)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.18_250/0.025)_1px,transparent_1px)] bg-size-[4rem_4rem]">
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <MobileHeader />
          <PageTransition>{children}</PageTransition>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
