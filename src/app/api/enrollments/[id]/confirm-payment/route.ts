import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

// POST /api/enrollments/:id/confirm-payment
// Học viên bấm "Xác nhận đã thanh toán" -> chuyển sang chờ admin xác nhận,
// KHÔNG mở khoá học ngay. Chỉ khi admin bấm "Xác nhận" (route /approve)
// thì trạng thái mới thành CONFIRMED và học viên mới truy cập được tài liệu.
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
    title: "Học viên vừa báo đã thanh toán",
    message: `${session.user.name || "Một học viên"} báo đã thanh toán khoá học "${enrollment.course.title}". Vui lòng kiểm tra và xác nhận.`,
    link: `/admin/enrollments?status=AWAITING_CONFIRMATION&highlight=${enrollment.id}`,
  });

  return NextResponse.json(updated);
}
