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
    oldest: { createdAt: "asc" },
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    popular_desc: { enrollments: { _count: "desc" } },
    popular_asc: { enrollments: { _count: "asc" } },
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

  // Đính kèm trạng thái đăng ký của người dùng hiện tại (nếu có) cho mỗi
  // khoá học, để phía client hiển thị huy hiệu "đã đăng ký / chờ xác nhận..."
  if (session?.user && !isAdmin) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.user.id,
        courseId: { in: courses.map((c) => c.id) },
      },
      select: { courseId: true, status: true },
    });
    const statusByCourseId = new Map(enrollments.map((e) => [e.courseId, e.status]));
    return NextResponse.json(
      courses.map((c) => ({
        ...c,
        myEnrollmentStatus: statusByCourseId.get(c.id) || null,
      }))
    );
  }

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
    lessons,
    videoUrl,
    published,
    materials,
  } = body;

  if (
    !title ||
    !description ||
    !level ||
    !duration ||
    Number(duration) <= 0 ||
    !lessons ||
    Number(lessons) <= 0 ||
    !videoUrl
  ) {
    return NextResponse.json(
      {
        error:
          "Vui lòng nhập đầy đủ tất cả các trường bắt buộc (tiêu đề, mô tả, trình độ, thời lượng, số bài giảng, ảnh/video giới thiệu).",
      },
      { status: 400 }
    );
  }

  const validMaterials: {
    name: string;
    description: string;
    files: { url: string; type: string; name: string; category: string }[];
    order: number;
  }[] = Array.isArray(materials)
    ? materials
        .map((m: any) => ({
          name: String(m?.name || ""),
          description: String(m?.description || ""),
          files: Array.isArray(m?.files)
            ? m.files
                .filter((f: any) => f?.url)
                .map((f: any) => ({
                  url: String(f.url),
                  type: String(f.type || ""),
                  name: String(f.name || ""),
                  category: f?.category === "exercise" ? "exercise" : "lecture",
                }))
            : [],
        }))
        .filter((m) => m.name && m.files.length > 0)
        .map((m, i) => ({ ...m, order: i }))
    : [];

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
      lessons: Number(lessons) || 0,
      videoUrl: videoUrl || null,
      published: published ?? true,
      ...(validMaterials.length > 0
        ? { materials: { create: validMaterials } }
        : {}),
    },
    include: { materials: true },
  });

  return NextResponse.json(course, { status: 201 });
}
