import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

// POST /api/enrollments/:id/approve  (ADMIN)
// Xác nhận đã nhận được thanh toán -> mở khoá học cho học viên
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: params.id },
    include: { course: true },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Không tìm thấy lượt đăng ký" }, { status: 404 });
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  await notifyUser({
    userId: enrollment.userId,
    type: "ENROLLMENT_CONFIRMED",
    title: "Đăng ký khoá học thành công",
    message: `Khoá học "${enrollment.course.title}" của bạn đã được xác nhận thanh toán và mở khoá. Chúc bạn học tốt!`,
    link: `/courses/${enrollment.courseId}`,
  });

  return NextResponse.json(updated);
}
