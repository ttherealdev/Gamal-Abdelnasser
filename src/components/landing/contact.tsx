import { MapPin, Phone, Mail, Clock, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "العنوان",
      details: "عنوان",
    },
    {
      icon: Phone,
      title: "الهاتف",
      details: "010",
    },
    {
      icon: Mail,
      title: "البريد الإلكتروني",
      details: "info@gamalschool.com",
    },
    {
      icon: Clock,
      title: "ساعات العمل",
      details: "السبت - الخميس، ٧:٣٠ ص - ٣:٠٠ م",
    },
  ];

  return (
    <section
      id="contact"
      className="py-24 md:py-32 bg-background relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <span className="inline-block text-primary text-sm font-semibold tracking-wide mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
                  تواصل معنا
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                  نسعد بتواصلكم
                  <span className="bg-linear-to-l from-primary to-primary/70 bg-clip-text text-transparent">
                    {" "}
                    معنا
                  </span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  نرحب بجميع استفساراتكم واقتراحاتكم. فريقنا جاهز لمساعدتكم
                  والإجابة على جميع أسئلتكم
                </p>
              </div>

              <div className="grid gap-4">
                {contactInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 group p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shrink-0 shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-0.5">
                        {info.title}
                      </div>
                      <div className="font-semibold text-foreground">
                        {info.details}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="bg-linear-to-l from-primary to-primary/90 text-primary-foreground hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 rounded-full px-8 h-14 gap-3 group transition-all duration-300 text-base">
                <Send className="h-5 w-5" />
                <span>راسلنا الآن</span>
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </Button>
            </div>

            <div className="relative">
              <div className="bg-card rounded-3xl h-full min-h-112.5 flex items-center justify-center overflow-hidden border border-border/50 shadow-xl shadow-primary/5 relative">
              {/* Decorative pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.5_0.18_250/0.05)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.5_0.18_250/0.05)_1px,transparent_1px)] bg-size-[2rem_2rem]" />

              <div className="text-center p-8 relative z-10">
                <div className="flex h-24 w-24 mx-auto items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground mb-6 shadow-xl shadow-primary/25">
                <MapPin className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                موقعنا
                </h3>
                <p className="text-muted-foreground text-lg">
                 عنوان
                </p>
                <a href="https://maps.app.goo.gl/Qk3CRVrMQ4rGq1CS6" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-primary font-medium hover:opacity-80 transition-opacity">
                <span>عرض على الخريطة</span>
                <ArrowLeft className="h-4 w-4" />
                </a>
              </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/15 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
