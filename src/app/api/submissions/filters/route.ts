import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/submissions/filters (chỉ ADMIN)
// Trả về TOÀN BỘ khoá học và TOÀN BỘ bài tập (CourseMaterial có ít nhất 1 tệp
// loại "exercise") của mỗi khoá học - dùng để đổ vào 2 bộ lọc "Khoá học" /
// "Bài tập" ở trang Bài nộp & chữa bài. Khác với việc suy ra danh sách này từ
// chính dữ liệu bài nộp (Submission), cách này đảm bảo hiện đủ khoá học/bài
// tập kể cả khi chưa có học viên nào nộp bài.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
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

  const result = courses.map((c: (typeof courses)[number]) => ({
    id: c.id,
    title: c.title,
    materials: c.materials
      .filter((m: (typeof c.materials)[number]) => {
        const files = Array.isArray(m.files) ? (m.files as any[]) : [];
        return files.some((f) => f?.category === "exercise");
      })
      .map((m: (typeof c.materials)[number]) => ({ id: m.id, name: m.name })),
  }));

  return NextResponse.json(result);
}
