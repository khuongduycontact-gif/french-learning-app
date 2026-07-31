import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { studentName, studentEmail, courseTitle, startTime, duration, note } = body;

  if (studentName !== undefined && !String(studentName).trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên học viên." }, { status: 400 });
  }
  if (studentEmail !== undefined && !EMAIL_RE.test(String(studentEmail).trim())) {
    return NextResponse.json({ error: "Vui lòng nhập đúng định dạng gmail học viên." }, { status: 400 });
  }
  if (courseTitle !== undefined && !String(courseTitle).trim()) {
    return NextResponse.json({ error: "Vui lòng nhập tên khoá học." }, { status: 400 });
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

  const schedule = await prisma.studentSchedule.update({
    where: { id: params.id },
    data: {
      ...(studentName !== undefined ? { studentName: String(studentName).trim() } : {}),
      ...(studentEmail !== undefined ? { studentEmail: String(studentEmail).trim() } : {}),
      ...(courseTitle !== undefined ? { courseTitle: String(courseTitle).trim() } : {}),
      ...(parsedStart !== undefined ? { startTime: parsedStart } : {}),
      ...(duration !== undefined ? { duration: Number(duration) } : {}),
      ...(note !== undefined ? { note: note ? String(note).trim() : null } : {}),
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
