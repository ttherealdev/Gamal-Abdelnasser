"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur-sm md:hidden">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80">
          <span className="text-xs font-bold text-primary-foreground">ج</span>
        </div>
        <span className="text-sm font-bold">مدرسة جمال عبدالناصر</span>
      </div>
    </header>
  );
}
