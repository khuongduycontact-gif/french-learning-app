import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureRecurringSchedulesMaterialized } from "@/lib/recurringSchedule";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/schedules?from=yyyy-mm-dd&to=yyyy-mm-dd (chỉ ADMIN)
// Lấy toàn bộ ca học có startTime trong khoảng [from, to] (dùng để đổ vào
// thời khoá biểu theo tuần đang xem trên trang quản trị).
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const fromDate = from ? new Date(`${from}T00:00:00`) : null;
  const toDate = to ? new Date(`${to}T23:59:59.999`) : null;

  // Bấm "tuần sau" đủ nhiều lần vẫn phải luôn thấy đúng buổi học của các
  // lịch lặp hàng tuần -> sinh sẵn (nếu còn thiếu) các buổi cụ thể tới hết
  // tuần đang xem trước khi truy vấn.
  if (toDate) {
    await ensureRecurringSchedulesMaterialized(toDate);
  }

  const schedules = await prisma.studentSchedule.findMany({
    where: {
      ...(fromDate || toDate
        ? {
            startTime: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    },
    orderBy: { startTime: "asc" },
  });

  return NextResponse.json(schedules);
}

// POST /api/schedules (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { studentName, studentEmail, courseTitle, startTime, duration, note } = body;

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

  const schedule = await prisma.studentSchedule.create({
    data: {
      studentName: String(studentName).trim(),
      studentEmail: String(studentEmail).trim(),
      courseTitle: String(courseTitle).trim(),
      startTime: parsedStart,
      duration: parsedDuration,
      note: note ? String(note).trim() : null,
    },
  });

  return NextResponse.json(schedule, { status: 201 });
}
