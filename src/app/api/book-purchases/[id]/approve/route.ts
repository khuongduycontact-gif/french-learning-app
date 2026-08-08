import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

// POST /api/book-purchases/:id/approve  (ADMIN)
// Xác nhận đã nhận được thanh toán -> mở sách cho người dùng
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
    data: { status: "CONFIRMED", confirmedAt: new Date() },
  });

  await notifyUser({
    userId: purchase.userId,
    type: "BOOK_PURCHASE_CONFIRMED",
    title: "Mua sách thành công",
    message: `Sách "${purchase.book.title}" của bạn đã được xác nhận thanh toán và mở khoá. Chúc bạn đọc vui!`,
    link: `/books/${purchase.bookId}`,
  });

  return NextResponse.json(updated);
}
