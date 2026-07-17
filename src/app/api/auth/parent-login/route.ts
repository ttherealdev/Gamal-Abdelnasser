import { auth } from "@/server/better-auth";
import { studentCodeToParentEmail } from "@/server/api/services/user.service";
import { db } from "@/server/db";
import { checkRateLimit, clearRateLimit, clientIp } from "@/lib/rate-limit";

// NOTE: this route calls auth.api.signInEmail as a direct in-process
// function call, not over HTTP — it does not pass through better-auth's own
// rate-limiting middleware. Without a limiter here, studentCode is a
// low-entropy, guessable identifier and the initial password is admin-set
// (not random), so this endpoint is brute-forceable without one.
const PER_STUDENT_LIMIT = { maxAttempts: 5, windowMs: 10 * 60_000, lockoutMs: 15 * 60_000 };
const PER_IP_LIMIT = { maxAttempts: 30, windowMs: 10 * 60_000, lockoutMs: 15 * 60_000 };

export async function POST(req: Request) {
  const body = (await req.json()) as { studentCode?: string; password?: string };
  const studentCode = body.studentCode?.trim();
  const password = body.password;

  if (!studentCode || !password) {
    return Response.json({ error: "أدخل كود الطالب وكلمة المرور" }, { status: 400 });
  }

  const ip = clientIp(req.headers);
  const studentKey = `${ip}:${studentCode.toLowerCase()}`;

  const ipCheck = checkRateLimit(ip, PER_IP_LIMIT);
  const studentCheck = checkRateLimit(studentKey, PER_STUDENT_LIMIT);
  if (!ipCheck.allowed || !studentCheck.allowed) {
    const retryAfterSeconds = Math.max(ipCheck.retryAfterSeconds ?? 0, studentCheck.retryAfterSeconds ?? 0);
    return Response.json(
      { error: "محاولات دخول كثيرة جداً، حاول مرة أخرى بعد قليل" },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  const student = await db.student.findUnique({
    where: { studentCode },
    select: { parentUserId: true },
  });

  if (!student?.parentUserId) {
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }

  try {
    const response = await auth.api.signInEmail({
      body: { email: studentCodeToParentEmail(studentCode), password },
      asResponse: true,
    });
    clearRateLimit(ip);
    clearRateLimit(studentKey);
    return response;
  } catch {
    return Response.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
  }
}
