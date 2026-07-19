import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/enrollments -> danh sách khoá học người dùng hiện tại đã đăng ký
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(enrollments);
}

// POST /api/enrollments { courseId } -> đăng ký khoá học
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đăng ký" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "Thiếu mã khoá học" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Không tìm thấy khoá học" }, { status: 404 });
  }

  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Bạn đã đăng ký khoá học này rồi" },
        { status: 409 }
      );
    }
    throw e;
  }
}
