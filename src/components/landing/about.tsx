import { Target, Eye, Award, Heart } from "lucide-react"

export default function AboutSection() {
  const features = [
    {
      icon: Target,
      title: "رؤيتنا",
      description: "أن نكون مدرسة رائدة في تقديم تعليم متميز يُعد الطلاب للمستقبل ويغرس فيهم القيم الأصيلة.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Eye,
      title: "هدفنا",
      description: "تخريج طلاب متميزين علمياً ومهارياً، قادرين على المساهمة في بناء المجتمع والوطن.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Award,
      title: "تميزنا",
      description: "نحرص على توفير بيئة تعليمية محفزة مع استخدام أحدث الوسائل التعليمية والتقنية.",
      color: "from-violet-500 to-violet-600",
    },
    {
      icon: Heart,
      title: "قيمنا",
      description: "الأمانة، الإخلاص، الاحترام، التعاون، والسعي الدائم نحو التميز والإبداع.",
      color: "from-sky-500 to-sky-600",
    },
  ]

  return (
    <section id="about" className="py-24 md:py-32 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-24">
          <span className="inline-block text-primary text-sm font-semibold tracking-wide mb-4 px-4 py-1.5 bg-primary/10 rounded-full">
            من نحن
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            صرح تعليمي عريق يجمع بين
            <span className="bg-linear-to-l from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              الأصالة والمعاصرة
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            تأسست مدرسة جمال عبد الناصر لتكون منارة للعلم والمعرفة، حيث نؤمن بأن كل طالب يمتلك إمكانات فريدة تستحق أن
            تُصقل وتُنمى
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-background rounded-3xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 border border-border/50 hover:border-primary/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${feature.color} text-white mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
              >
                <feature.icon className="h-8 w-8" />
              </div>

              <h3 className="relative text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="relative text-muted-foreground leading-relaxed">{feature.description}</p>

              <div className="absolute top-0 left-0 w-24 h-24">
                <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-transparent rounded-tl-2xl transition-all duration-500 group-hover:border-primary/30 group-hover:w-20 group-hover:h-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
