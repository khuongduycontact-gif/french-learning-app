import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureRecurringSchedulesMaterialized } from "@/lib/recurringSchedule";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/schedules/recurring (chỉ ADMIN) - danh sách lịch lặp đang hoạt động
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const rules = await prisma.recurringSchedule.findMany({
    where: { active: true },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(rules);
}

// POST /api/schedules/recurring (chỉ ADMIN)
// Tạo 1 lịch lặp hàng tuần: sinh ngay buổi học đầu tiên (đúng startTime gửi
// lên) + sinh sẵn các buổi kế tiếp trong ~60 ngày tới. Nếu không truyền
// endDate, lịch sẽ tự động lặp lại hàng tuần vô thời hạn (mỗi lần có ai mở
// thời khoá biểu hoặc cron chạy, hệ thống sẽ tự sinh thêm buổi mới).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { studentName, studentEmail, courseTitle, startTime, duration, note, endDate } = body;

  if (!studentName || !String(studentName).trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên học viên." }, { status: 400 });
  }
  if (!studentEmail || !EMAIL_RE.test(String(studentEmail).trim())) {
    return NextResponse.json({ error: "Vui lòng nhập đúng định dạng gmail học viên." }, { status: 400 });
  }
  if (!courseTitle || !String(courseTitle).trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên khoá học." }, { status: 400 });
  }
  const parsedStart = startTime ? new Date(startTime) : null;
  if (!parsedStart || Number.isNaN(parsedStart.getTime())) {
    return NextResponse.json({ error: "Vui lòng chọn ngày giờ học hợp lệ." }, { status: 400 });
  }
  const parsedDuration = Number(duration);
  if (!parsedDuration || parsedDuration <= 0) {
    return NextResponse.json({ error: "Vui lòng nhập thời lượng buổi học lớn hơn 0." }, { status: 400 });
  }

  let parsedEndDate: Date | null = null;
  if (endDate) {
    parsedEndDate = new Date(endDate);
    if (Number.isNaN(parsedEndDate.getTime())) {
      return NextResponse.json({ error: "Ngày kết thúc lặp lịch không hợp lệ." }, { status: 400 });
    }
    if (parsedEndDate < parsedStart) {
      return NextResponse.json(
        { error: "Ngày kết thúc lặp lịch phải sau buổi học đầu tiên." },
        { status: 400 }
      );
    }
  }

  const trimmedNote = note ? String(note).trim() : null;

  const rule = await prisma.recurringSchedule.create({
    data: {
      studentName: String(studentName).trim(),
      studentEmail: String(studentEmail).trim(),
      courseTitle: String(courseTitle).trim(),
      startTime: parsedStart,
      duration: parsedDuration,
      note: trimmedNote,
      endDate: parsedEndDate,
      generatedUntil: parsedStart,
    },
  });

  // Buổi học đầu tiên (đúng startTime gốc) luôn được tạo ngay, không đợi
  // vòng sinh tiếp theo.
  await prisma.studentSchedule.create({
    data: {
      studentName: rule.studentName,
      studentEmail: rule.studentEmail,
      courseTitle: rule.courseTitle,
      startTime: rule.startTime,
      duration: rule.duration,
      note: rule.note,
      recurringId: rule.id,
    },
  });

  await ensureRecurringSchedulesMaterialized();

  const schedules = await prisma.studentSchedule.findMany({
    where: { recurringId: rule.id },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json({ rule, schedules }, { status: 201 });
}
