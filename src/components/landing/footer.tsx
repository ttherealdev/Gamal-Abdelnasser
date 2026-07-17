"use client";

import { GraduationCap, ArrowUp } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-linear-to-b from-foreground to-foreground/95 text-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <span className="font-bold text-2xl block">
                  مدرسة جمال عبد الناصر
                </span>
                <span className="text-primary text-sm font-medium">
                  التميز في التعليم
                </span>
              </div>
            </Link>
            <p className="text-background/70 leading-relaxed max-w-md text-base">
              صرح تعليمي عريق يسعى لبناء جيل متميز من الطلاب المتفوقين علمياً
              وأخلاقياً، من خلال بيئة تعليمية محفزة وكادر تدريسي متميز.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-background">
              روابط سريعة
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { href: "#about", label: "عن المدرسة" },
                { href: "#mission", label: "رسالتنا" },
                { href: "#departments", label: "الأقسام" },
                { href: "#contact", label: "تواصل معنا" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-background/60 hover:text-primary transition-colors hover:translate-x-1 inline-block"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-background">
              تواصل معنا
            </h4>
            <div className="flex flex-col gap-3 text-background/60">
              <p className="hover:text-background/80 transition-colors">
                عنوان
              </p>
              <p className="hover:text-background/80 transition-colors">
                هاتف: 010
              </p>
              <p className="hover:text-background/80 transition-colors">
                info@gamalschool.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-background/50 flex items-center gap-1">
              © {new Date().getFullYear()} مدرسة جمال عبد الناصر. جميع الحقوق
              محفوظة.
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-background/50 hover:text-primary transition-all group px-4 py-2 rounded-full hover:bg-background/5"
            >
              <span>العودة للأعلى</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/10 group-hover:bg-primary transition-colors">
                <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
