import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/trusted-websites?q=tu-khoa
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  const websites = await prisma.trustedWebsite.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { link: { contains: q } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(websites);
}

// POST /api/trusted-websites (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { name, link, description, coverImage } = body;

  if (!name || !link || !description) {
    return NextResponse.json(
      { error: "Vui lòng nhập đầy đủ tất cả các trường bắt buộc (tên, link, mô tả)." },
      { status: 400 }
    );
  }

  const website = await prisma.trustedWebsite.create({
    data: {
      name,
      link,
      description,
      coverImage: coverImage || null,
    },
  });

  return NextResponse.json(website, { status: 201 });
}
