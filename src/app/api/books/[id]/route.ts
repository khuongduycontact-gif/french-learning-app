import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const book = await prisma.book.findUnique({
    where: { id: params.id },
    include: { _count: { select: { purchases: true } } },
  });
  if (!book) {
    return NextResponse.json({ error: "Không tìm thấy sách" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  let isPurchased = book.price <= 0;
  if (session?.user && !isAdmin && book.price > 0) {
    const purchase = await prisma.bookPurchase.findUnique({
      where: { userId_bookId: { userId: session.user.id, bookId: book.id } },
      select: { status: true },
    });
    isPurchased = purchase?.status === "CONFIRMED";
  }

  // Sách trả phí mà chưa mua (hoặc chưa đăng nhập) thì không trả về đường
  // dẫn tệp nội dung — tránh việc gọi thẳng API để lấy được tệp PDF trả phí.
  if (!isAdmin && !isPurchased) {
    return NextResponse.json({ ...book, contentUrl: "" });
  }

  return NextResponse.json(book);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, coverImage, contentUrl, published } = body;

  const book = await prisma.book.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
      ...(contentUrl !== undefined ? { contentUrl } : {}),
      ...(published !== undefined ? { published } : {}),
    },
  });

  return NextResponse.json(book);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  await prisma.book.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
