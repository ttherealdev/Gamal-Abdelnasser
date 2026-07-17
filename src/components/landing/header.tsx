"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GraduationCap, Menu, ArrowLeft, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/server/better-auth/client";
import { useScrollShrink } from "@/hooks/use-scroll-shrink";

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const shrunk = useScrollShrink();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: session } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  const navLinks = [
    { href: "#about", label: "عن المدرسة" },
    { href: "#mission", label: "رسالتنا" },
    { href: "#departments", label: "المواد الدراسية" },
    { href: "#contact", label: "تواصل معنا" },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50",
        "transition-[height,background-color,backdrop-filter,box-shadow,border-color]",
        "duration-500 ease-in-out",
        shrunk
          ? [
              "h-15",
              "bg-card/85 backdrop-blur-xl",
              // "shadow-[0_4px_24px_oklch(0%_0_0/20%),0_1px_0_color-mix(in_oklch,var(--primary)_15%,transparent)]",
              "border-b border-border/20",
            ]
          : ["h-20", "border-b border-transparent bg-transparent"],
      )}
    >
      <div className="container mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="relative">
              <span className="absolute inset-0 rounded-xl bg-primary/30 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
              <div
                className={cn(
                  "relative flex items-center justify-center rounded-xl",
                  "bg-linear-to-br from-primary to-primary/80",
                  "shadow-[0_4px_16px_color-mix(in_oklch,var(--primary)_35%,transparent)]",
                  "transition-[width,height,border-radius,transform] duration-500 ease-in-out",
                  "group-hover:scale-110 group-hover:-rotate-3",
                  shrunk ? "h-9 w-9 rounded-lg" : "h-11 w-11",
                )}
              >
                <GraduationCap
                  className={cn(
                    "text-primary-foreground transition-all duration-500",
                    shrunk ? "h-5 w-5" : "h-6 w-6",
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col overflow-hidden">
              <span
                className={cn(
                  "leading-tight font-bold text-foreground transition-[font-size] duration-500",
                  shrunk ? "text-sm" : "text-base sm:text-lg",
                )}
              >
                مدرسة جمال عبد الناصر
              </span>
              <span
                className={cn(
                  "hidden text-xs font-medium text-primary sm:block",
                  "overflow-hidden transition-[max-height,opacity] duration-500",
                  shrunk ? "max-h-0 opacity-0" : "max-h-5 opacity-100",
                )}
              >
                التميز في التعليم
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-foreground/65 hover:text-foreground",
                  "rounded-full text-sm font-medium",
                  "transition-colors duration-200 hover:bg-primary/8",
                  "group",
                )}
              >
                {item.label}
                <span className="absolute bottom-1.5 left-1/2 block h-1 w-1 -translate-x-1/2 scale-0 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
              </Link>
            ))}
          </nav>

          {mounted && (
            <div className="hidden items-center gap-2 lg:flex">
              {isLoggedIn ? (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className="gap-2 rounded-full border-primary/20 bg-transparent px-5 transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <Link href="/dashboard">
                      <User className="h-4 w-4" />
                      <span>{session?.user?.name || "لوحة التحكم"}</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="gap-2 rounded-full px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>خروج</span>
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className={cn(
                    "group gap-2 rounded-full transition-all duration-300",
                    "bg-linear-to-l from-primary to-primary/90 text-primary-foreground",
                    "shadow-[0_2px_16px_color-mix(in_oklch,var(--primary)_40%,transparent)]",
                    "hover:-translate-y-0.5 hover:shadow-[0_4px_24px_color-mix(in_oklch,var(--primary)_55%,transparent)]",
                  )}
                >
                  <Link href="/login">
                    تسجيل الدخول
                    <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  </Link>
                </Button>
              )}
            </div>
          )}

          <Sheet
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <SheetTrigger
              asChild
              className="lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border border-transparent hover:border-primary/20 hover:bg-primary/10"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">فتح القائمة</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-full flex-col p-0 sm:w-95"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>القائمة الرئيسية</SheetTitle>
              </SheetHeader>

              <div className="flex items-center justify-center gap-3 border-b border-border/50 py-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm leading-tight font-bold text-foreground">
                    مدرسة جمال عبد الناصر
                  </span>
                  <span className="text-xs font-medium text-primary">التميز في التعليم</span>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto px-5 py-5">
                <div className="flex flex-col gap-1.5">
                  {navLinks.map((item, i) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-center text-foreground hover:text-primary",
                        "rounded-2xl px-6 py-3.5 text-base font-medium",
                        "border border-transparent hover:border-primary/12 hover:bg-primary/5",
                        "transition-all duration-200",
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </nav>

              {mounted && (
                <div className="space-y-2.5 border-t border-border/50 bg-muted/20 p-5">
                  {isLoggedIn ? (
                    <>
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="w-full gap-2 rounded-full border-primary/20 bg-background hover:border-primary/40 hover:bg-primary/5"
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          <span className="font-medium">
                            {session?.user?.name || "لوحة التحكم"}
                          </span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={handleLogout}
                        className="w-full gap-2 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">تسجيل الخروج</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      asChild
                      size="lg"
                      className="w-full gap-2 rounded-full shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="font-medium">تسجيل الدخول</span>
                        <ArrowLeft className="h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
