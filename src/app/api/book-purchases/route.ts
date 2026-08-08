import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentInfo, buildPaymentNote } from "@/lib/vietqr";

// GET /api/book-purchases -> danh sách sách người dùng hiện tại đã mua/đang mua
// GET /api/book-purchases?scope=admin[&status=...] -> (ADMIN) toàn bộ lượt mua
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const status = searchParams.get("status") || undefined;

  if (scope === "admin") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }
    const purchases = await prisma.bookPurchase.findMany({
      where: status ? { status: status as any } : {},
      include: {
        book: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(purchases);
  }

  const purchases = await prisma.bookPurchase.findMany({
    where: { userId: session.user.id },
    include: { book: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchases);
}

// POST /api/book-purchases { bookId } -> mua sách, trả về thông tin thanh toán VietQR
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để mua sách" }, { status: 401 });
  }

  const { bookId } = await req.json();
  if (!bookId) {
    return NextResponse.json({ error: "Thiếu mã sách" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Không tìm thấy sách" }, { status: 404 });
  }

  try {
    // Sách miễn phí -> kích hoạt luôn, không cần thanh toán
    const isFree = book.price <= 0;

    const purchase = await prisma.bookPurchase.create({
      data: {
        userId: session.user.id,
        bookId,
        status: isFree ? "CONFIRMED" : "PENDING_PAYMENT",
        confirmedAt: isFree ? new Date() : null,
      },
    });

    if (isFree) {
      return NextResponse.json({ purchase, payment: null }, { status: 201 });
    }

    const payment = buildPaymentInfo({ enrollmentId: purchase.id, amount: book.price });
    const updated = await prisma.bookPurchase.update({
      where: { id: purchase.id },
      data: { paidAmount: book.price, paymentNote: buildPaymentNote(purchase.id) },
    });

    return NextResponse.json({ purchase: updated, payment }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Bạn đã mua sách này rồi" },
        { status: 409 }
      );
    }
    throw e;
  }
}
