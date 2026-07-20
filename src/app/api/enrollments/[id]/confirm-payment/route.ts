import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins, notifyUser } from "@/lib/notifications";

// POST /api/enrollments/:id/confirm-payment
// Học viên bấm "Tôi đã thanh toán" -> mở khoá học luôn, không cần chờ admin duyệt
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: params.id },
    include: { course: true },
  });

  if (!enrollment || enrollment.userId !== session.user.id) {
    return NextResponse.json({ error: "Không tìm thấy lượt đăng ký" }, { status: 404 });
  }

  if (enrollment.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "Yêu cầu này đã được xử lý trước đó" },
      { status: 409 }
    );
  }

  const updated = await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  await notifyUser({
    userId: enrollment.userId,
    type: "ENROLLMENT_CONFIRMED",
    title: "Đăng ký khoá học thành công",
    message: `Khoá học "${enrollment.course.title}" của bạn đã được mở khoá. Chúc bạn học tốt!`,
    link: `/courses/${enrollment.courseId}`,
  });

  await notifyAdmins({
    title: "Học viên vừa thanh toán khoá học",
    message: `${session.user.name || "Một học viên"} đã báo thanh toán và được mở khoá học "${enrollment.course.title}" tự động.`,
    link: "/admin/enrollments",
  });

  return NextResponse.json(updated);
}
