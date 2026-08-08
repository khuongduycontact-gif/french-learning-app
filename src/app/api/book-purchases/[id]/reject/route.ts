import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

// POST /api/book-purchases/:id/reject  (ADMIN)
// Không xác nhận được thanh toán -> đưa về trạng thái chờ thanh toán để
// người dùng thử lại
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const purchase = await prisma.bookPurchase.findUnique({
    where: { id: params.id },
    include: { book: true },
  });
  if (!purchase) {
    return NextResponse.json({ error: "Không tìm thấy lượt mua sách" }, { status: 404 });
  }

  const updated = await prisma.bookPurchase.update({
    where: { id: purchase.id },
    data: { status: "PENDING_PAYMENT" },
  });

  await notifyUser({
    userId: purchase.userId,
    type: "BOOK_PAYMENT_REJECTED",
    title: "Chưa xác nhận được thanh toán",
    message: `Chúng tôi chưa tìm thấy thanh toán của bạn cho sách "${purchase.book.title}". Vui lòng kiểm tra lại hoặc thanh toán lại.`,
    link: `/books/${purchase.bookId}`,
  });

  return NextResponse.json(updated);
}
