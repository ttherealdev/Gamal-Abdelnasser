import { computeGradeLetter } from "./grading";

function baseStyles() {
  return `
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 32px; direction: rtl; color: #1a1a1a; }
    .header { text-align: center; border-bottom: 3px solid #1E4FD3; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 4px; font-size: 22px; }
    .header p { margin: 2px 0; color: #555; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: center; font-size: 13px; }
    th { background: #1E4FD3; color: #fff; }
    tr:nth-child(even) { background: #f7f8fc; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
    .total-row td { font-weight: bold; background: #eef1fd; }
    @media print {
      body { padding: 10px; }
      .no-print { display: none; }
    }
  `;
}

function printButton() {
  return `<div class="no-print" style="margin-top:24px;text-align:center;">
    <button onclick="window.print()" style="padding:12px 40px;background:#1E4FD3;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:16px;">
      طباعة التقرير
    </button>
  </div>`;
}

export interface ClassReportInput {
  classCode: string;
  academicYearId: string;
  examTypeLabel: string;
  subjects: { id: string; name: string; maxScore: number }[];
  rows: {
    studentName: string;
    studentCode: string;
    cells: { subjectId: string; practicalScore: number; writtenScore: number; totalScore: number }[];
  }[];
}

export function buildClassReportHtml(input: ClassReportInput): string {
  const totalMax = input.subjects.reduce((sum, s) => sum + s.maxScore, 0);

  const rows = input.rows
    .map((row) => {
      const total = row.cells.reduce((sum, c) => sum + c.totalScore, 0);
      const cells = row.cells
        .map((c) => `<td>${c.totalScore}</td>`)
        .join("");
      return `<tr><td>${row.studentCode}</td><td>${row.studentName}</td>${cells}<td><strong>${total}</strong></td><td>${computeGradeLetter(total, totalMax)}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>تقرير فصل ${input.classCode}</title>
<style>${baseStyles()}</style></head>
<body>
  <div class="header">
    <h1>مدرسة جمال عبدالناصر العسكرية الثانوية بنين</h1>
    <p>تقرير درجات — فصل ${input.classCode} — ${input.examTypeLabel} — ${input.academicYearId}</p>
  </div>
  <table>
    <thead><tr>
      <th>الكود</th><th>الاسم</th>
      ${input.subjects.map((s) => `<th>${s.name}<br/>/${s.maxScore}</th>`).join("")}
      <th>المجموع</th><th>التقدير</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${printButton()}
</body></html>`;
}

export interface StudentReportInput {
  studentName: string;
  studentCode: string;
  classCode: string;
  academicYearId: string;
  examTypeLabel: string;
  grades: {
    subjectName: string;
    maxScore: number;
    practicalScore: number;
    writtenScore: number;
    totalScore: number;
    gradeLetter: string;
  }[];
  totalScore: number;
  totalMax: number;
  gradeLetter: string | null;
}

export function buildStudentReportHtml(input: StudentReportInput): string {
  const rows = input.grades
    .map(
      (g) =>
        `<tr><td>${g.subjectName}</td><td>${g.maxScore}</td><td>${g.practicalScore}</td><td>${g.writtenScore}</td><td>${g.totalScore}</td><td>${g.gradeLetter}</td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>تقرير الطالب ${input.studentName}</title>
<style>${baseStyles()}</style></head>
<body>
  <div class="header">
    <h1>مدرسة جمال عبدالناصر العسكرية الثانوية بنين</h1>
    <p>تقرير درجات طالب — ${input.examTypeLabel} — ${input.academicYearId}</p>
  </div>
  <div class="meta">
    <span><strong>الاسم:</strong> ${input.studentName}</span>
    <span><strong>الكود:</strong> ${input.studentCode}</span>
    <span><strong>الفصل:</strong> ${input.classCode}</span>
  </div>
  <table>
    <thead><tr><th>المادة</th><th>الدرجة العظمى</th><th>العملي</th><th>التحريري</th><th>المجموع</th><th>التقدير</th></tr></thead>
    <tbody>
      ${rows}
      <tr class="total-row"><td colspan="4">المجموع الكلي</td><td>${input.totalScore} / ${input.totalMax}</td><td>${input.gradeLetter ?? "—"}</td></tr>
    </tbody>
  </table>
  ${printButton()}
</body></html>`;
}

export interface ClassMonthlyReportInput {
  classCode: string;
  academicYearId: string;
  monthLabel: string;
  subjectName: string;
  maxima: { behavior: number; notebook: number; test: number; exam: number };
  rows: {
    studentName: string;
    studentCode: string;
    behaviorTotal: number;
    notebookTotal: number;
    testTotal: number;
    examScore: number | null;
  }[];
}

// NOTE: one month = 4 weeks combined into totals + the monthly exam — never
// a week-by-week breakdown, matching how the school actually wants to read
// a class's standing for the month.
export function buildClassMonthlyReportHtml(input: ClassMonthlyReportInput): string {
  const totalMax = input.maxima.behavior + input.maxima.notebook + input.maxima.test + input.maxima.exam;

  const rows = input.rows
    .map((row) => {
      const total = row.behaviorTotal + row.notebookTotal + row.testTotal + (row.examScore ?? 0);
      return `<tr><td>${row.studentCode}</td><td>${row.studentName}</td><td>${row.behaviorTotal}</td><td>${row.notebookTotal}</td><td>${row.testTotal}</td><td>${row.examScore ?? "—"}</td><td><strong>${total}</strong></td><td>${computeGradeLetter(total, totalMax)}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>تقرير فصل ${input.classCode} — ${input.monthLabel}</title>
<style>${baseStyles()}</style></head>
<body>
  <div class="header">
    <h1>مدرسة جمال عبدالناصر العسكرية الثانوية بنين</h1>
    <p>تقرير درجات — فصل ${input.classCode} — ${input.subjectName} — ${input.monthLabel} — ${input.academicYearId}</p>
  </div>
  <table>
    <thead><tr>
      <th>الكود</th><th>الاسم</th>
      <th>سلوك<br/>/${input.maxima.behavior}</th>
      <th>كشكول<br/>/${input.maxima.notebook}</th>
      <th>تقييم أسبوعي<br/>/${input.maxima.test}</th>
      <th>اختبار الشهر<br/>/${input.maxima.exam}</th>
      <th>المجموع<br/>/${totalMax}</th>
      <th>التقدير</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${printButton()}
</body></html>`;
}

export interface StudentMonthlyReportInput {
  studentName: string;
  studentCode: string;
  classCode: string;
  academicYearId: string;
  subjects: {
    subjectName: string;
    maxPerMonth: number;
    months: { month: number; monthLabel: string; total: number }[];
  }[];
}

// NOTE: this is the report a parent/admin actually wants — every month a
// student has recorded grades in, combined into one total per month per
// subject. Never a week-by-week column, per explicit request.
export function buildStudentMonthlyReportHtml(input: StudentMonthlyReportInput): string {
  const allMonthLabels = Array.from(
    new Map(input.subjects.flatMap((s) => s.months).map((m) => [m.month, m.monthLabel])).entries(),
  ).sort((a, b) => a[0] - b[0]);

  const rows = input.subjects
    .map((s) => {
      const byMonth = new Map(s.months.map((m) => [m.month, m.total]));
      const cells = allMonthLabels.map(([month]) => `<td>${byMonth.get(month) ?? "—"}</td>`).join("");
      const grandTotal = s.months.reduce((sum, m) => sum + m.total, 0);
      return `<tr><td>${s.subjectName}</td>${cells}<td><strong>${grandTotal}</strong></td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8" /><title>تقرير الطالب — ${input.studentName}</title>
<style>${baseStyles()}</style></head>
<body>
  <div class="header">
    <h1>مدرسة جمال عبدالناصر العسكرية الثانوية بنين</h1>
    <p>تقرير الدرجات الشهرية — ${input.academicYearId}</p>
  </div>
  <div class="meta">
    <span><strong>الاسم:</strong> ${input.studentName}</span>
    <span><strong>الكود:</strong> ${input.studentCode}</span>
    <span><strong>الفصل:</strong> ${input.classCode}</span>
  </div>
  <table>
    <thead><tr>
      <th>المادة</th>
      ${allMonthLabels.map(([, label]) => `<th>${label}</th>`).join("")}
      <th>المجموع الكلي</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  ${printButton()}
</body></html>`;
}

export function openPrintWindow(html: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
}
