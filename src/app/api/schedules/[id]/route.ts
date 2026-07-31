import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEmailList, normalizeEmailList } from "@/lib/emailList";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { className, studentEmails, startTime, duration, note } = body;

  if (className !== undefined && !String(className).trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên lớp." }, { status: 400 });
  }
  if (studentEmails !== undefined && !isValidEmailList(String(studentEmails))) {
    return NextResponse.json(
      { error: "Vui lòng nhập đúng định dạng gmail học viên (có thể nhập nhiều, cách nhau bởi dấu phẩy)." },
      { status: 400 }
    );
  }
  let parsedStart: Date | undefined;
  if (startTime !== undefined) {
    parsedStart = new Date(startTime);
    if (Number.isNaN(parsedStart.getTime())) {
      return NextResponse.json({ error: "Vui lòng chọn ngày giờ học hợp lệ." }, { status: 400 });
    }
  }
  if (duration !== undefined && (!Number(duration) || Number(duration) <= 0)) {
    return NextResponse.json({ error: "Vui lòng nhập thời lượng buổi học lớn hơn 0." }, { status: 400 });
  }

  // Nếu đổi sang giờ học khác, phải reset reminderSentAt về NULL - nếu
  // không, buổi học đã từng gửi mail nhắc (hoặc đã trôi qua cửa sổ 8 tiếng
  // cũ) sẽ bị cron bỏ qua vĩnh viễn cho giờ học mới, coi như "đã gửi" dù
  // thực ra chưa hề gửi cho giờ mới này.
  let resetReminder = false;
  if (parsedStart !== undefined) {
    const existing = await prisma.studentSchedule.findUnique({
      where: { id: params.id },
      select: { startTime: true },
    });
    if (existing && existing.startTime.getTime() !== parsedStart.getTime()) {
      resetReminder = true;
    }
  }

  const schedule = await prisma.studentSchedule.update({
    where: { id: params.id },
    data: {
      ...(className !== undefined ? { className: String(className).trim() } : {}),
      ...(studentEmails !== undefined ? { studentEmails: normalizeEmailList(String(studentEmails)) } : {}),
      ...(parsedStart !== undefined ? { startTime: parsedStart } : {}),
      ...(duration !== undefined ? { duration: Number(duration) } : {}),
      ...(note !== undefined ? { note: note ? String(note).trim() : null } : {}),
      ...(resetReminder ? { reminderSentAt: null } : {}),
    },
  });

  return NextResponse.json(schedule);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  await prisma.studentSchedule.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
