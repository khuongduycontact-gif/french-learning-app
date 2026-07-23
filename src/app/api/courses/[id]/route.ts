import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { enrollments: true } },
      materials: { orderBy: { order: "asc" } },
    },
  });
  if (!course) {
    return NextResponse.json({ error: "Không tìm thấy khoá học" }, { status: 404 });
  }
  return NextResponse.json(course);
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

  // materials chỉ được đồng bộ (xoá hết + tạo lại) khi client có gửi mảng này lên,
  // để tránh vô tình xoá tài liệu nếu một client cũ nào đó gọi PUT mà không có trường này.
  if (Array.isArray(materials)) {
    const validMaterials = materials
      .map((m: any) => ({
        courseId: params.id,
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
      .map((m, i) => ({ ...m, order: i }));

    await prisma.$transaction([
      prisma.courseMaterial.deleteMany({ where: { courseId: params.id } }),
      ...(validMaterials.length > 0
        ? [prisma.courseMaterial.createMany({ data: validMaterials })]
        : []),
    ]);
  }

  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(level !== undefined ? { level } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(duration !== undefined ? { duration: Number(duration) } : {}),
      ...(lessons !== undefined ? { lessons: Number(lessons) } : {}),
      ...(videoUrl !== undefined ? { videoUrl } : {}),
      ...(published !== undefined ? { published } : {}),
    },
    include: { materials: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(course);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
