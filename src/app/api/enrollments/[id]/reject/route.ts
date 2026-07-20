import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

// POST /api/enrollments/:id/reject  (ADMIN)
// Không xác nhận được thanh toán -> đưa về trạng thái chờ thanh toán để học viên thử lại
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
    data: { status: "PENDING_PAYMENT" },
  });

  await notifyUser({
    userId: enrollment.userId,
    type: "PAYMENT_REJECTED",
    title: "Chưa xác nhận được thanh toán",
    message: `Chúng tôi chưa tìm thấy thanh toán của bạn cho khoá học "${enrollment.course.title}". Vui lòng kiểm tra lại hoặc thanh toán lại.`,
    link: `/courses/${enrollment.courseId}`,
  });

  return NextResponse.json(updated);
}
