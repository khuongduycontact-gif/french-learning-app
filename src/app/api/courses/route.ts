import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// GET /api/courses?q=tu-khoa&level=A1
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const level = searchParams.get("level") || undefined;
  const sort = searchParams.get("sort") || "newest";

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  const orderByMap: Record<string, any> = {
    newest: { createdAt: "desc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    title_asc: { title: "asc" },
  };

  const courses = await prisma.course.findMany({
    where: {
      // Người dùng thường chỉ thấy khoá đã xuất bản, admin thấy tất cả
      ...(isAdmin ? {} : { published: true }),
      ...(level ? { level: level as any } : {}),
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
    include: { _count: { select: { enrollments: true } } },
  });

  return NextResponse.json(courses);
}

// POST /api/courses (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title,
    description,
    level,
    price,
    duration,
    sessions,
    lessons,
    imageUrl,
    videoUrl,
    published,
  } = body;

  if (
    !title ||
    !description ||
    !level ||
    !duration ||
    Number(duration) <= 0 ||
    !sessions ||
    Number(sessions) <= 0 ||
    !lessons ||
    Number(lessons) <= 0 ||
    !imageUrl
  ) {
    return NextResponse.json(
      {
        error:
          "Vui lòng nhập đầy đủ tất cả các trường bắt buộc (tiêu đề, mô tả, trình độ, thời lượng, số buổi học, số bài giảng, ảnh bìa).",
      },
      { status: 400 }
    );
  }

  let slug = slugify(title);
  const existing = await prisma.course.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description,
      level,
      price: Number(price) || 0,
      duration: Number(duration) || 0,
      sessions: Number(sessions) || 0,
      lessons: Number(lessons) || 0,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      published: published ?? true,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
