import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-24 pb-24">
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="absolute -top-24 -right-20 w-180 h-180 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,var(--primary)_14%,transparent)_0%,transparent_62%)]" />
        <div className="absolute -bottom-36 -left-20 w-150 h-150 bg-[radial-gradient(circle_at_center,color-mix(in_oklch,oklch(0.57_0.174_262)_9%,transparent)_0%,transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(color-mix(in_oklch,var(--primary)_2.8%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--primary)_2.8%,transparent)_1px,transparent_1px)] bg-size-[48px_48px]" />
        <div className="absolute bottom-0 inset-x-0 h-56 bg-linear-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            مرحباً بكم في صرح التعليم المتميز
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.08] tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <span className="block text-foreground">بناء المستقبل</span>
            <span className="block mt-2 bg-linear-to-l from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent py-3">
              يبدأ من هنا
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
            مدرسة جمال عبد الناصر — حيث يلتقي التميز الأكاديمي بالقيم الأصيلة
            لتخريج جيل قادر على قيادة المستقبل
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-8 gap-3 text-base font-bold group bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_2px_8px_color-mix(in_oklch,var(--primary)_25%,transparent),0_6px_24px_color-mix(in_oklch,var(--primary)_20%,transparent)] hover:shadow-[0_4px_12px_color-mix(in_oklch,var(--primary)_35%,transparent),0_10px_32px_color-mix(in_oklch,var(--primary)_30%,transparent)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href="/login">
                ابدأ رحلتك التعليمية
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:-translate-x-1">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </span>
              </Link>
            </Button>

            <Link
              href="#about"
              className="inline-flex items-center gap-2 h-14 px-7 rounded-full text-base font-semibold text-foreground/65 hover:text-foreground border border-border hover:border-primary/30 hover:bg-primary/5 bg-background/60 backdrop-blur-sm transition-all duration-200 hover:-translate-y-px"
            >
              اكتشف المزيد
              <span className="text-foreground/30 text-sm">↓</span>
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-6 gap-3 md:gap-4">
            <div className="col-span-6 md:col-span-4 relative overflow-hidden rounded-3xl p-7 bg-linear-to-br from-[#1e3a8a] to-primary text-white min-h-40 hover:-translate-y-1 hover:shadow-[0_12px_40px_color-mix(in_oklch,var(--primary)_40%,transparent)] transition-all duration-300">
              <div className="text-[44px] font-black leading-none mb-2">
                +٥٠٠
              </div>
              <div className="text-base font-semibold opacity-90">
                طالب وطالبة
              </div>
              <div className="text-sm opacity-50 mt-1">
                من مختلف أحياء المدينة
              </div>
              <svg
                className="absolute left-6 bottom-5 opacity-[0.15]"
                width="96"
                height="68"
                viewBox="0 0 96 68"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="18" cy="20" r="12" fill="white" />
                <path
                  d="M4 60c0-7.7 6.3-14 14-14h8c7.7 0 14 6.3 14 14"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="48" cy="18" r="13" fill="white" />
                <path
                  d="M33 60c0-8.3 6.7-15 15-15h8c8.3 0 15 6.7 15 15"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="78" cy="20" r="12" fill="white" />
                <path
                  d="M64 60c0-7.7 6.3-14 14-14h8"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="col-span-3 md:col-span-2 relative overflow-hidden rounded-3xl p-6 bg-card border border-border/60 hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--primary)_7%,transparent)] transition-all duration-300">
              <div className="text-[40px] font-black leading-none bg-linear-to-br from-primary to-indigo-500 bg-clip-text text-transparent mb-2">
                +٥٠
              </div>
              <div className="text-sm font-semibold text-foreground">
                معلم متميز
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                كفاءات تربوية معتمدة
              </div>
              <svg
                className="absolute left-5 bottom-4 opacity-[0.08]"
                width="58"
                height="58"
                viewBox="0 0 58 58"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 50V20L29 8l23 12v30"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <rect
                  x="20"
                  y="32"
                  width="18"
                  height="18"
                  rx="2"
                  fill="currentColor"
                />
                <path
                  d="M29 8v11M12 50h34"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="col-span-3 md:col-span-2 relative overflow-hidden rounded-3xl p-6 bg-primary/5 border border-primary/12 hover:-translate-y-1 transition-all duration-300">
              <div className="text-[11px] font-bold tracking-widest uppercase text-primary mb-2 opacity-70">
                منذ
              </div>
              <div className="text-[40px] font-black leading-none text-foreground mb-2">
                +٢٠
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                عامًا من التميز
              </div>
              <svg
                className="absolute left-5 bottom-4 opacity-[0.1]"
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="27"
                  cy="27"
                  r="21"
                  stroke="var(--primary)"
                  strokeWidth="2"
                />
                <path
                  d="M27 12v15l9.5 5.5"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="27" cy="5" r="2" fill="var(--primary)" />
                <circle cx="27" cy="49" r="2" fill="var(--primary)" />
                <circle cx="5" cy="27" r="2" fill="var(--primary)" />
                <circle cx="49" cy="27" r="2" fill="var(--primary)" />
              </svg>
            </div>

            <div className="col-span-3 md:col-span-2 relative overflow-hidden rounded-3xl p-6 bg-card border border-border/60 hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_color-mix(in_oklch,var(--primary)_7%,transparent)] transition-all duration-300">
              <div className="text-[40px] font-black leading-none bg-linear-to-br from-primary to-indigo-500 bg-clip-text text-transparent mb-2">
                ٩٨٪
              </div>
              <div className="text-sm font-semibold text-foreground">
                نسبة النجاح
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                الثانوية العامة
              </div>
              <svg
                className="absolute left-4 bottom-4 opacity-[0.07]"
                width="52"
                height="56"
                viewBox="0 0 52 56"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M14 4h24l-6 22H20L14 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <line
                  x1="14"
                  y1="4"
                  x2="6"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="38"
                  y1="4"
                  x2="46"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="26"
                  cy="42"
                  r="13"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21 42l3.5 3.5 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="col-span-3 md:col-span-2 rounded-3xl p-6 bg-linear-to-br from-indigo-50/80 to-blue-50/60 dark:from-indigo-950/40 dark:to-blue-950/30 border border-primary/10 hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl font-serif text-primary/20 leading-none mb-2 select-none">
                "
              </div>
              <p className="text-xs font-semibold text-foreground leading-relaxed mb-3">
                قُم للمعلِّم وفِّهِ التبجيلا — كادَ المعلِّمُ أن يكونَ رسولا
              </p>
              <div className="text-[10px] text-muted-foreground/60">
                — أحمد شوقي
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
