import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmins } from "@/lib/notifications";

// GET /api/submissions -> (học viên) danh sách bài nộp của chính mình,
//   lọc thêm được theo ?courseId=
// GET /api/submissions?scope=admin[&courseId=&materialId=&status=] -> (ADMIN)
//   toàn bộ bài nộp của mọi học viên, để admin lọc đúng khoá học/bài tập cần chữa
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const courseId = searchParams.get("courseId") || undefined;
  const materialId = searchParams.get("materialId") || undefined;
  const status = searchParams.get("status") || undefined;

  if (scope === "admin") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }
    const submissions = await prisma.submission.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(materialId ? { materialId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        course: { select: { id: true, title: true } },
        material: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true, image: true } },
        gradedBy: { select: { id: true, name: true } },
      },
      orderBy: { submittedAt: "desc" },
    });
    return NextResponse.json(submissions);
  }

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      ...(courseId ? { courseId } : {}),
    },
    include: {
      course: { select: { id: true, title: true } },
      material: { select: { id: true, name: true } },
      gradedBy: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(submissions);
}

// POST /api/submissions { materialId, files, note } -> học viên nộp bài (hoặc
// nộp lại) cho đúng 1 tài liệu bài tập của 1 khoá học. Mỗi học viên chỉ có
// đúng 1 bản nộp cho mỗi tài liệu — nộp lại sẽ ghi đè tệp cũ và chuyển trạng
// thái về "chờ chữa" (xoá kết quả chữa bài trước đó, nếu có).
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const body = await req.json();
  const materialId = body?.materialId as string | undefined;
  const files = body?.files;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 2000) : null;

  if (!materialId) {
    return NextResponse.json({ error: "Thiếu mã tài liệu bài tập" }, { status: 400 });
  }
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "Vui lòng đính kèm ít nhất 1 tệp bài làm" }, { status: 400 });
  }

  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    select: { id: true, name: true, courseId: true, course: { select: { title: true } } },
  });
  if (!material) {
    return NextResponse.json({ error: "Không tìm thấy tài liệu bài tập" }, { status: 404 });
  }

  // Chỉ học viên đã được xác nhận (đã mở khoá) mới được nộp bài cho đúng
  // khoá học chứa tài liệu này.
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId: material.courseId } },
    select: { status: true },
  });
  if (!enrollment || enrollment.status !== "CONFIRMED") {
    return NextResponse.json(
      { error: "Bạn cần được mở khoá học này trước khi nộp bài" },
      { status: 403 }
    );
  }

  const submission = await prisma.submission.upsert({
    where: { userId_materialId: { userId: session.user.id, materialId } },
    create: {
      courseId: material.courseId,
      materialId,
      userId: session.user.id,
      files,
      note,
      status: "SUBMITTED",
    },
    update: {
      files,
      note,
      status: "SUBMITTED",
      submittedAt: new Date(),
      // Nộp lại bài mới -> xoá kết quả chữa bài cũ để admin chữa lại từ đầu
      gradedFiles: null,
      gradedNote: null,
      gradedById: null,
      gradedAt: null,
    },
  });

  await notifyAdmins({
    type: "SUBMISSION_RECEIVED",
    title: "Học viên vừa nộp bài tập",
    message: `${session.user.name || session.user.email} đã nộp bài "${material.name}" — khoá học "${material.course.title}".`,
    link: `/admin/submissions?highlight=${submission.id}`,
  });

  return NextResponse.json(submission, { status: 201 });
}
