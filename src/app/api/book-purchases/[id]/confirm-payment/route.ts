import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

// POST /api/book-purchases/:id/confirm-payment
// Người dùng bấm "Xác nhận đã thanh toán" -> chuyển sang chờ admin xác
// nhận, KHÔNG mở khoá sách ngay. Chỉ khi admin bấm "Xác nhận" (route
// /approve) thì trạng thái mới thành CONFIRMED và người dùng mới tải/xem
// được nội dung sách.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const purchase = await prisma.bookPurchase.findUnique({
    where: { id: params.id },
    include: { book: true },
  });

  if (!purchase || purchase.userId !== session.user.id) {
    return NextResponse.json({ error: "Không tìm thấy lượt mua sách" }, { status: 404 });
  }

  if (purchase.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "Yêu cầu này đã được xử lý trước đó" },
      { status: 409 }
    );
  }

  const updated = await prisma.bookPurchase.update({
    where: { id: purchase.id },
    data: { status: "AWAITING_CONFIRMATION" },
  });

  await notifyAdmins({
    type: "BOOK_PAYMENT_SUBMITTED",
    title: "Có người vừa báo đã thanh toán mua sách",
    message: `${session.user.name || "Một người dùng"} báo đã thanh toán sách "${purchase.book.title}". Vui lòng kiểm tra và xác nhận.`,
    link: `/admin/book-purchases?status=AWAITING_CONFIRMATION&highlight=${purchase.id}`,
  });

  return NextResponse.json(updated);
}
