import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/materials/[id]/deadline -> (học viên) lấy đếm giờ nộp bài hiện
// tại của chính mình cho tài liệu bài tập này (null nếu chưa từng tải).
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const deadline = await prisma.submissionDeadline.findUnique({
    where: { userId_materialId: { userId: session.user.id, materialId: params.id } },
  });
  return NextResponse.json(deadline);
}

// POST /api/materials/[id]/deadline -> (học viên) bắt đầu đếm giờ nộp bài
// khi tải/xem tài liệu bài tập lần đầu tiên. Idempotent: nếu đã có bản ghi
// rồi thì trả về nguyên bản ghi cũ, KHÔNG reset lại giờ đếm (chỉ admin mới
// được đặt lại hạn nộp bài).
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const material = await prisma.courseMaterial.findUnique({
    where: { id: params.id },
    select: { id: true, courseId: true },
  });
  if (!material) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu bài tập" }, { status: 404 });
  }

  // Chỉ học viên đã được mở khoá học mới được bắt đầu đếm giờ (khớp điều
  // kiện được phép nộp bài).
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: material.courseId } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Bạn cần được mở khoá học này trước" },
      { status: 403 }
    );
  }

  const existing = await prisma.submissionDeadline.findUnique({
    where: { userId_materialId: { userId: session.user.id, materialId: params.id } },
  });
  if (existing) {
    return NextResponse.json(existing);
  }

  const deadline = await prisma.submissionDeadline.create({
    data: {
      materialId: params.id,
      userId: session.user.id,
    },
  });
  return NextResponse.json(deadline, { status: 201 });
}
