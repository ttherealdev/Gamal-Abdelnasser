"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ── Types ── */
type Subject = {
  name: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  iconBg: string;
  icon: React.ReactNode;
  pattern: React.ReactNode;
};

/* ── SVG subject icons ── */
const IconArabic = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M5 20 Q9 8 13 6 Q17 8 21 20"
      stroke="#2563eb"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M8 15h10"
      stroke="#2563eb"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle
      cx="13"
      cy="6"
      r="1.5"
      fill="#2563eb"
    />
  </svg>
);
const IconEnglish = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <circle
      cx="13"
      cy="13"
      r="9"
      stroke="#4f46e5"
      strokeWidth="1.8"
      fill="none"
    />
    <ellipse
      cx="13"
      cy="13"
      rx="4"
      ry="9"
      stroke="#4f46e5"
      strokeWidth="1.4"
      fill="none"
    />
    <path
      d="M4 13h18"
      stroke="#4f46e5"
      strokeWidth="1.4"
    />
  </svg>
);
const IconMath = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M5 8h6M8 5v6M15 8h6"
      stroke="#7c3aed"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15 17l6 6M21 17l-6 6"
      stroke="#7c3aed"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="8"
      cy="19"
      r="3.5"
      stroke="#7c3aed"
      strokeWidth="1.8"
      fill="none"
    />
  </svg>
);
const IconMathPure = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M5 20 L10 5 L15 15 L18 10 L22 20"
      stroke="#7c3aed"
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);
const IconPhysics = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <ellipse
      cx="13"
      cy="13"
      rx="10"
      ry="4"
      stroke="#0ea5e9"
      strokeWidth="1.8"
      fill="none"
    />
    <ellipse
      cx="13"
      cy="13"
      rx="10"
      ry="4"
      stroke="#0ea5e9"
      strokeWidth="1.8"
      fill="none"
      transform="rotate(60 13 13)"
    />
    <ellipse
      cx="13"
      cy="13"
      rx="10"
      ry="4"
      stroke="#0ea5e9"
      strokeWidth="1.8"
      fill="none"
      transform="rotate(120 13 13)"
    />
    <circle
      cx="13"
      cy="13"
      r="2"
      fill="#0ea5e9"
    />
  </svg>
);
const IconChemistry = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M10 4v8L5 20h16L16 12V4"
      stroke="#10b981"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <path
      d="M9 4h8"
      stroke="#10b981"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle
      cx="10"
      cy="17"
      r="1.5"
      fill="#10b981"
    />
    <circle
      cx="16"
      cy="15"
      r="1"
      fill="#10b981"
    />
  </svg>
);
const IconBiology = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M13 21C13 21 5 17 5 10a8 8 0 0116 0c0 7-8 11-8 11z"
      stroke="#d97706"
      strokeWidth="1.8"
      fill="none"
    />
    <path
      d="M13 4C13 4 10 8 10 13c0 4 3 8 3 8s3-4 3-8c0-5-3-9-3-9z"
      stroke="#d97706"
      strokeWidth="1.4"
      fill="none"
    />
    <path
      d="M5 10Q13 12 21 10"
      stroke="#d97706"
      strokeWidth="1.4"
      fill="none"
    />
  </svg>
);
const IconHistory = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M6 20V8l7-4 7 4v12"
      stroke="#e11d48"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <rect
      x="10"
      y="13"
      width="6"
      height="7"
      rx="1"
      stroke="#e11d48"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M6 8L13 4L20 8"
      stroke="#e11d48"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);
const IconGeography = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <circle
      cx="13"
      cy="11"
      r="5"
      stroke="#f97316"
      strokeWidth="1.8"
      fill="none"
    />
    <path
      d="M13 16L13 22"
      stroke="#f97316"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M9 22h8"
      stroke="#f97316"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle
      cx="13"
      cy="11"
      r="1.5"
      fill="#f97316"
    />
  </svg>
);
const IconPhilosophy = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M8 16Q8 6 13 5Q18 6 18 13Q18 19 13 21Q10 19 8 16Z"
      stroke="#8b5cf6"
      strokeWidth="1.7"
      fill="none"
    />
    <path
      d="M10 10Q13 8 16 10"
      stroke="#8b5cf6"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M13 14v4"
      stroke="#8b5cf6"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IconReligion = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M19 7A7 7 0 1 1 13 20"
      stroke="#0d9488"
      strokeWidth="1.8"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M21 13A4 4 0 0 1 13 17"
      stroke="#0d9488"
      strokeWidth="1.4"
      fill="none"
    />
    <circle
      cx="20"
      cy="7"
      r="1.5"
      fill="#0d9488"
    />
  </svg>
);
const IconStats = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <rect
      x="5"
      y="14"
      width="4"
      height="8"
      rx="1.5"
      fill="#db2777"
      fillOpacity="0.3"
    />
    <rect
      x="11"
      y="9"
      width="4"
      height="13"
      rx="1.5"
      fill="#db2777"
      fillOpacity="0.5"
    />
    <rect
      x="17"
      y="5"
      width="4"
      height="17"
      rx="1.5"
      fill="#db2777"
    />
    <path
      d="M4 22h18"
      stroke="#db2777"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
const IconGeology = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
  >
    <path
      d="M5 20L9 12L13 16L17 8L21 20Z"
      stroke="#b45309"
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <path
      d="M5 20h16"
      stroke="#b45309"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Per-card SVG tile patterns ── */
const DotPattern = ({ color }: { color: string }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
    viewBox="0 0 180 160"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern
        id={`dots-${color.replace("#", "")}`}
        width="18"
        height="18"
        patternUnits="userSpaceOnUse"
      >
        <circle
          cx="2"
          cy="2"
          r="1.5"
          fill={color}
        />
      </pattern>
    </defs>
    <rect
      width="180"
      height="160"
      fill={`url(#dots-${color.replace("#", "")})`}
    />
  </svg>
);
const GridPattern = ({ color }: { color: string }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
    viewBox="0 0 180 160"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern
        id={`grid-${color.replace("#", "")}`}
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M0 10h20M10 0v20`}
          stroke={color}
          strokeWidth="0.6"
        />
      </pattern>
    </defs>
    <rect
      width="180"
      height="160"
      fill={`url(#grid-${color.replace("#", "")})`}
    />
  </svg>
);
const HexPattern = ({ color }: { color: string }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
    viewBox="0 0 180 160"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern
        id={`hex-${color.replace("#", "")}`}
        width="32"
        height="28"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M16 2L30 10L30 18L16 26L2 18L2 10Z"
          stroke={color}
          strokeWidth="0.7"
          fill="none"
        />
      </pattern>
    </defs>
    <rect
      width="180"
      height="160"
      fill={`url(#hex-${color.replace("#", "")})`}
    />
  </svg>
);
const DiagPattern = ({ color }: { color: string }) => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.08]"
    viewBox="0 0 180 160"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern
        id={`diag-${color.replace("#", "")}`}
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 0L20 20M20 0L0 20"
          stroke={color}
          strokeWidth="0.6"
        />
      </pattern>
    </defs>
    <rect
      width="180"
      height="160"
      fill={`url(#diag-${color.replace("#", "")})`}
    />
  </svg>
);

/* ── Data ── */
const grade10: Subject[] = [
  {
    name: "اللغة العربية",
    tag: "أساسي",
    tagColor: "#2563eb",
    tagBg: "#eff6ff",
    iconBg: "from-blue-100 to-blue-200",
    icon: <IconArabic />,
    pattern: <DotPattern color="#2563eb" />,
  },
  {
    name: "اللغة الإنجليزية",
    tag: "أساسي",
    tagColor: "#4f46e5",
    tagBg: "#eef2ff",
    iconBg: "from-indigo-100 to-indigo-200",
    icon: <IconEnglish />,
    pattern: <GridPattern color="#4f46e5" />,
  },
  {
    name: "الرياضيات",
    tag: "أساسي",
    tagColor: "#7c3aed",
    tagBg: "#f5f3ff",
    iconBg: "from-violet-100 to-violet-200",
    icon: <IconMath />,
    pattern: <HexPattern color="#7c3aed" />,
  },

  {
    name: "علوم متكاملة",

    tag: "أساسي",
    tagColor: "#d97706",
    tagBg: "#fffbeb",
    iconBg: "from-amber-100 to-amber-200",
    icon: <IconBiology />,
    pattern: <DiagPattern color="#d97706" />,
  },
  {
    name: "التاريخ",
    tag: "أساسي",
    tagColor: "#e11d48",
    tagBg: "#fff1f2",
    iconBg: "from-rose-100 to-rose-200",
    icon: <IconHistory />,
    pattern: <GridPattern color="#e11d48" />,
  },

  {
    name: "الفلسفة والمنطق",
    tag: "أساسي",
    tagColor: "#8b5cf6",
    tagBg: "#faf5ff",
    iconBg: "from-purple-100 to-purple-200",
    icon: <IconPhilosophy />,
    pattern: <HexPattern color="#8b5cf6" />,
  },
  {
    name: "التربية الدينية",
    tag: "أساسي",
    tagColor: "#0d9488",
    tagBg: "#f0fdfa",
    iconBg: "from-teal-100 to-teal-200",
    icon: <IconReligion />,
    pattern: <DotPattern color="#0d9488" />,
  },
];

const grade11: Subject[] = [
  {
    name: "اللغة العربية",
    tag: "أساسي",
    tagColor: "#2563eb",
    tagBg: "#eff6ff",
    iconBg: "from-blue-100 to-blue-200",
    icon: <IconArabic />,
    pattern: <DotPattern color="#2563eb" />,
  },
  {
    name: "اللغة الإنجليزية",
    tag: "أساسي",
    tagColor: "#4f46e5",
    tagBg: "#eef2ff",
    iconBg: "from-indigo-100 to-indigo-200",
    icon: <IconEnglish />,
    pattern: <GridPattern color="#4f46e5" />,
  },
  {
    name: "الرياضيات",
    tag: "علمي",
    tagColor: "#7c3aed",
    tagBg: "#f5f3ff",
    iconBg: "from-violet-100 to-violet-200",
    icon: <IconMathPure />,
    pattern: <HexPattern color="#7c3aed" />,
  },

  {
    name: "الفيزياء",
    tag: "علمي",
    tagColor: "#0ea5e9",
    tagBg: "#f0f9ff",
    iconBg: "from-sky-100 to-sky-200",
    icon: <IconPhysics />,
    pattern: <DotPattern color="#0ea5e9" />,
  },
  {
    name: "الكيمياء",
    tag: "علمي",
    tagColor: "#10b981",
    tagBg: "#ecfdf5",
    iconBg: "from-emerald-100 to-emerald-200",
    icon: <IconChemistry />,
    pattern: <HexPattern color="#10b981" />,
  },
  {
    name: "الإحصاء",
    tag: "أدبي",
    tagColor: "#db2777",
    tagBg: "#fdf2f8",
    iconBg: "from-pink-100 to-pink-200",
    icon: <IconStats />,
    pattern: <DiagPattern color="#db2777" />,
  },

  {
    name: "التاريخ",
    tag: "أساسي",
    tagColor: "#e11d48",
    tagBg: "#fff1f2",
    iconBg: "from-rose-100 to-rose-200",
    icon: <IconHistory />,
    pattern: <GridPattern color="#e11d48" />,
  },
  {
    name: "الجغرافيا",
    tag: "أدبي",
    tagColor: "#f97316",
    tagBg: "#fff7ed",
    iconBg: "from-orange-100 to-orange-200",
    icon: <IconGeography />,
    pattern: <DiagPattern color="#f97316" />,
  },
  {
    name: "الفلسفة والمنطق",
    tag: "أدبي",
    tagColor: "#8b5cf6",
    tagBg: "#faf5ff",
    iconBg: "from-purple-100 to-purple-200",
    icon: <IconPhilosophy />,
    pattern: <HexPattern color="#8b5cf6" />,
  },
  {
    name: "التربية الدينية",
    tag: "أساسي",
    tagColor: "#0d9488",
    tagBg: "#f0fdfa",
    iconBg: "from-teal-100 to-teal-200",
    icon: <IconReligion />,
    pattern: <DotPattern color="#0d9488" />,
  },
];

/* ── Subject card ── */
function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <div className="group relative flex cursor-default flex-col gap-3.5 overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_10px_36px_var(--primary)/0.08]">
      {subject.pattern}
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-[14px] bg-linear-to-br ${subject.iconBg} shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
      >
        {subject.icon}
      </div>
      <div className="relative">
        <div className="mb-2 text-sm leading-snug font-bold text-foreground">{subject.name}</div>
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ color: subject.tagColor, background: subject.tagBg }}
        >
          {subject.tag}
        </span>
      </div>
    </div>
  );
}

/* ── Section ── */
export default function DepartmentsSection() {
  return (
    <section
      id="departments"
      className="relative overflow-hidden py-24 md:py-28"
    >
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 text-sm font-bold tracking-wide text-primary">
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <rect
                x="0.5"
                y="0.5"
                width="5"
                height="5"
                rx="1.5"
                fill="var(--primary)"
              />
              <rect
                x="7.5"
                y="0.5"
                width="5"
                height="5"
                rx="1.5"
                fill="var(--primary)"
                fillOpacity="0.5"
              />
              <rect
                x="0.5"
                y="7.5"
                width="5"
                height="5"
                rx="1.5"
                fill="var(--primary)"
                fillOpacity="0.5"
              />
              <rect
                x="7.5"
                y="7.5"
                width="5"
                height="5"
                rx="1.5"
                fill="var(--primary)"
              />
            </svg>
            المواد الدراسية
          </span>
          <h2 className="mb-4 text-3xl leading-tight font-black text-foreground sm:text-4xl md:text-[42px]">
            المناهج الدراسية
            <span className="bg-linear-to-l from-primary to-indigo-500 bg-clip-text text-transparent">
              {" "}
              بالمرحلة الثانوية
            </span>
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            منهج متكامل يجمع بين العلوم والآداب لبناء شخصية متوازنة قادرة على التفكير والإبداع
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="grade10"
          dir="rtl"
        >
          <div className="mb-8 flex justify-center">
            <TabsList className="px-2 py-6">
              <TabsTrigger
                value="grade10"
                className="flex items-center gap-2 rounded-[10px] px-6 py-4.5 text-sm font-bold transition-all duration-300 data-[state=active]:bg-linear-to-l data-[state=active]:from-primary data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="3"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <rect
                    x="2"
                    y="7"
                    width="9"
                    height="2.5"
                    rx="1.25"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <rect
                    x="2"
                    y="11.5"
                    width="6"
                    height="2"
                    rx="1"
                    fill="currentColor"
                    opacity="0.35"
                  />
                </svg>
                الصف الأول الثانوي
                <span className="rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-black data-[state=active]:bg-white/20">
                  10
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="grade11"
                className="flex items-center gap-2 rounded-[10px] px-6 py-4.5 text-sm font-bold transition-all duration-300 data-[state=active]:bg-linear-to-l data-[state=active]:from-primary data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <rect
                    x="2"
                    y="2"
                    width="12"
                    height="3"
                    rx="1.5"
                    fill="currentColor"
                    opacity="0.7"
                  />
                  <rect
                    x="2"
                    y="7"
                    width="9"
                    height="2.5"
                    rx="1.25"
                    fill="currentColor"
                    opacity="0.5"
                  />
                  <rect
                    x="2"
                    y="11.5"
                    width="6"
                    height="2"
                    rx="1"
                    fill="currentColor"
                    opacity="0.35"
                  />
                </svg>
                الصف الثاني الثانوي
                <span className="rounded-full bg-current/10 px-2 py-0.5 text-[11px] font-black">
                  11
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="grade10"
            className="mt-0 animate-in duration-300 fade-in slide-in-from-bottom-2"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {grade10.map((s) => (
                <SubjectCard
                  key={s.name}
                  subject={s}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="grade11"
            className="mt-0 animate-in duration-300 fade-in slide-in-from-bottom-2"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
              {grade11.map((s) => (
                <SubjectCard
                  key={s.name}
                  subject={s}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
