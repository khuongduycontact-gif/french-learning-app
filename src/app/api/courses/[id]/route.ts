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
    include: { _count: { select: { enrollments: true } } },
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
    sessions,
    lessons,
    imageUrl,
    videoUrl,
    published,
  } = body;

  const course = await prisma.course.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(level !== undefined ? { level } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(duration !== undefined ? { duration: Number(duration) } : {}),
      ...(sessions !== undefined ? { sessions: Number(sessions) } : {}),
      ...(lessons !== undefined ? { lessons: Number(lessons) } : {}),
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(videoUrl !== undefined ? { videoUrl } : {}),
      ...(published !== undefined ? { published } : {}),
    },
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
