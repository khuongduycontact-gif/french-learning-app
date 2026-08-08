import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// GET /api/books?q=tu-khoa&sort=newest
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const sort = searchParams.get("sort") || "newest";

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const orderByMap: Record<string, any> = {
    newest: { createdAt: "desc" },
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    popular_desc: { purchases: { _count: "desc" } },
    popular_asc: { purchases: { _count: "asc" } },
  };

  const books = await prisma.book.findMany({
    where: {
      // Người dùng thường chỉ thấy sách đã xuất bản, admin thấy tất cả
      ...(isAdmin ? {} : { published: true }),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: orderByMap[sort] || orderByMap.newest,
    include: { _count: { select: { purchases: true } } },
  });

  // Đính kèm trạng thái mua của người dùng hiện tại cho mỗi cuốn sách, để
  // phía client hiển thị huy hiệu "đã mua / chờ xác nhận..." trên BookCard.
  if (session?.user && !isAdmin) {
    const purchases = await prisma.bookPurchase.findMany({
      where: {
        userId: session.user.id,
        bookId: { in: books.map((b) => b.id) },
      },
      select: { bookId: true, status: true },
    });
    const statusByBookId = new Map(purchases.map((p) => [p.bookId, p.status]));
    return NextResponse.json(
      books.map((b) => ({
        ...b,
        myPurchaseStatus: statusByBookId.get(b.id) || null,
      }))
    );
  }

  return NextResponse.json(books);
}

// POST /api/books (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, coverImage, contentUrl, published } = body;

  if (!title || !description || !contentUrl) {
    return NextResponse.json(
      {
        error:
          "Vui lòng nhập đầy đủ tất cả các trường bắt buộc (tên sách, mô tả, tệp nội dung PDF).",
      },
      { status: 400 }
    );
  }

  let slug = slugify(title);
  const existing = await prisma.book.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const book = await prisma.book.create({
    data: {
      title,
      slug,
      description,
      price: Number(price) || 0,
      coverImage: coverImage || null,
      contentUrl,
      published: published ?? true,
    },
  });

  return NextResponse.json(book, { status: 201 });
}
