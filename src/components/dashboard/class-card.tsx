"use client";

import { BookOpen, ChevronLeft } from "lucide-react";

interface ClassCardProps {
  code: string;
  studentCount: number;
  onClick: () => void;
}

export function ClassCard({ code, studentCount, onClick }: ClassCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card text-right transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-linear-to-l from-primary via-primary/60 to-transparent" />
      <div className="absolute top-0 right-0 size-20 rounded-full bg-primary/5 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
            <BookOpen className="size-6" />
          </div>
          <div className="flex size-8 items-center justify-center rounded-full bg-muted/50 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
            <ChevronLeft className="size-4 rotate-180" />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-bold text-foreground">فصل {code}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{studentCount} طالب</p>
      </div>
    </button>
  );
}
