import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/submissions/filters?scope=admin (chỉ ADMIN)
//   Trả về TOÀN BỘ khoá học và TOÀN BỘ bài tập (CourseMaterial có ít nhất 1
//   tệp loại "exercise") của mỗi khoá học - dùng để đổ vào 2 bộ lọc "Khoá
//   học" / "Bài tập" ở trang Bài nộp & chữa bài. Khác với việc suy ra danh
//   sách này từ chính dữ liệu bài nộp (Submission), cách này đảm bảo hiện đủ
//   khoá học/bài tập kể cả khi chưa có học viên nào nộp bài.
// GET /api/submissions/filters (mặc định, học viên)
//   Trả về các khoá học học viên hiện tại ĐÃ ĐĂNG KÝ và được xác nhận
//   (CONFIRMED) kèm bài tập của từng khoá, dùng cho bộ lọc ở trang "Bài tập
//   của tôi".
function extractCourseWithExerciseMaterials(c: {
  id: string;
  title: string;
  materials: { id: string; name: string; files: unknown }[];
}) {
  return {
    id: c.id,
    title: c.title,
    materials: c.materials
      .filter((m) => {
        const files = Array.isArray(m.files) ? (m.files as any[]) : [];
        return files.some((f) => f?.category === "exercise");
      })
      .map((m) => ({ id: m.id, name: m.name })),
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");

  if (scope === "admin") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        materials: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, files: true },
        },
      },
    });
    return NextResponse.json(courses.map(extractCourseWithExerciseMaterials));
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id, status: "CONFIRMED" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          materials: {
            orderBy: { order: "asc" },
            select: { id: true, name: true, files: true },
          },
        },
      },
    },
    orderBy: { confirmedAt: "desc" },
  });

  return NextResponse.json(
    enrollments.map((e: (typeof enrollments)[number]) => extractCourseWithExerciseMaterials(e.course))
  );
}

