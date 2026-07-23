import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/deadlines/[id]/reset { hours? } -> (ADMIN) mở khoá tính năng
// nộp bài cho học viên: đặt lại mốc đếm giờ về thời điểm hiện tại, học
// viên có thêm `hours` giờ (mặc định 48) kể từ bây giờ để nộp bài.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const rawHours = Number(body?.hours);
  const hours = Number.isFinite(rawHours) && rawHours > 0 ? Math.round(rawHours) : 48;

  const existing = await prisma.submissionDeadline.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy bản ghi hạn nộp bài" }, { status: 404 });
  }

  const deadline = await prisma.submissionDeadline.update({
    where: { id: params.id },
    data: { startedAt: new Date(), hours },
    include: {
      material: { select: { id: true, name: true, courseId: true, course: { select: { id: true, title: true } } } },
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  return NextResponse.json({
    id: deadline.id,
    materialId: deadline.materialId,
    userId: deadline.userId,
    startedAt: deadline.startedAt.toISOString(),
    hours: deadline.hours,
    material: { id: deadline.material.id, name: deadline.material.name },
    course: deadline.material.course,
    user: deadline.user,
  });
}
