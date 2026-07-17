import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MissionSection() {
  const missionPoints = [
    "توفير بيئة تعليمية آمنة ومحفزة للإبداع",
    "استخدام أحدث التقنيات والوسائل التعليمية",
    "تنمية مهارات التفكير النقدي والإبداعي",
    "غرس القيم الأخلاقية والوطنية",
    "تشجيع الأنشطة اللاصفية والمشاركة المجتمعية",
    "بناء شراكة فعالة مع أولياء الأمور",
  ];

  return (
    <section
      id="mission"
      className="py-24 md:py-32 bg-background overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0.18_250/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.18_250/0.02)_1px,transparent_1px)] bg-size-[3rem_3rem]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1">
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 p-1 bg-linear-to-br from-primary/20 via-primary/10 to-transparent">
                <div className="rounded-[1.25rem] overflow-hidden">
                  <Image
                    src="/class.jpg"
                    alt="طلاب في الفصل الدراسي"
                    className="w-full h-auto aspect-4/3 object-cover"
                    width={500}
                    height={500}
                    priority
                  />
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl p-6 shadow-2xl shadow-primary/10 border border-border/50 max-w-55 backdrop-blur-sm">
                <div className="text-5xl font-bold bg-linear-to-l from-primary to-primary/70 bg-clip-text text-transparent mb-1">
                  +٢٠
                </div>
                <div className="text-sm text-muted-foreground">
                  عاماً من التميز في التعليم
                </div>
              </div>

              {/* Decorative */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -right-4 w-24 h-24 bg-primary/15 rounded-full blur-xl" />
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-8 order-1 lg:order-2">
            <div>
              <span className="inline-block text-primary text-sm font-semibold tracking-wide mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
                رسالتنا
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                نُعد جيلاً واعياً قادراً على
                <span className="bg-linear-to-l from-primary to-primary/70 bg-clip-text text-transparent">
                  {" "}
                  صناعة المستقبل
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                نسعى إلى إعداد جيل متميز من خلال منظومة تعليمية متكاملة تجمع بين
                العلم والأخلاق، وتُمكّن الطلاب من مواجهة تحديات العصر بثقة
                وكفاءة.
              </p>
            </div>

            <div className="grid gap-3">
              {missionPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 group p-3 rounded-xl hover:bg-primary/5 transition-all duration-300"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground shrink-0 shadow-md shadow-primary/20 transition-all duration-300 group-hover:scale-110">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-foreground font-medium">{point}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Link href="#contact">
              <Button
                variant="ghost"
                className="gap-2 text-primary hover:bg-primary/10 group text-base"
              >
                تواصل معنا للمزيد
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
