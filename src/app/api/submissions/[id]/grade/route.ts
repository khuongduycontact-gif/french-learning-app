import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

// POST /api/submissions/[id]/grade { files, note } -> (ADMIN) gửi lại bài đã
// chữa cho đúng học viên đã nộp, đúng tài liệu/khoá học của bài nộp đó.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const files = body?.files;
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 2000) : null;

  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "Vui lòng đính kèm ít nhất 1 tệp bài đã chữa" }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      userId: true,
      material: { select: { name: true } },
      course: { select: { title: true } },
    },
  });
  if (!submission) {
    return NextResponse.json({ error: "Không tìm thấy bài nộp" }, { status: 404 });
  }

  const updated = await prisma.submission.update({
    where: { id: params.id },
    data: {
      gradedFiles: files,
      gradedNote: note,
      status: "GRADED",
      gradedById: session.user.id,
      gradedAt: new Date(),
    },
    include: {
      course: { select: { id: true, title: true } },
      material: { select: { id: true, name: true } },
      gradedBy: { select: { id: true, name: true } },
    },
  });

  await notifyUser({
    userId: submission.userId,
    type: "SUBMISSION_GRADED",
    title: "Bài tập của bạn đã được chữa",
    message: `Bài "${submission.material.name}" — khoá học "${submission.course.title}" đã được chữa xong.`,
    link: `/submissions?highlight=${submission.id}`,
  });

  return NextResponse.json(updated);
}
