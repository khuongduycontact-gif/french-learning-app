import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/deadlines?courseId=&materialId= -> (ADMIN) toàn bộ đếm giờ nộp
// bài của mọi học viên, kèm thông tin khoá học/tài liệu/học viên, để admin
// lọc đúng học viên/tài liệu cần mở khoá lại hạn nộp bài.
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId") || undefined;
  const materialId = searchParams.get("materialId") || undefined;

  const deadlines = await prisma.submissionDeadline.findMany({
    where: {
      ...(materialId ? { materialId } : {}),
      ...(courseId ? { material: { courseId } } : {}),
    },
    include: {
      material: { select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true } } } },
      user: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const result = deadlines.map((d: (typeof deadlines)[number]) => ({
    id: d.id,
    materialId: d.materialId,
    userId: d.userId,
    startedAt: d.startedAt.toISOString(),
    hours: d.hours,
    material: { id: d.material.id, name: d.material.name },
    course: d.material.course,
    user: d.user,
  }));

  return NextResponse.json(result);
}
