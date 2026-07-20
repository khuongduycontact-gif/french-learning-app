import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

// POST /api/enrollments/:id/confirm-payment
// Học viên bấm "Tôi đã thanh toán" -> chuyển trạng thái sang chờ admin xác nhận
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
    data: { status: "AWAITING_CONFIRMATION" },
  });

  await notifyAdmins({
    title: "Có học viên báo đã thanh toán",
    message: `${session.user.name || "Một học viên"} đã xác nhận thanh toán khoá học "${enrollment.course.title}". Vui lòng kiểm tra và duyệt.`,
    link: "/admin/enrollments",
  });

  return NextResponse.json(updated);
}
