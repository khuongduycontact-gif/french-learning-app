import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const achievement = await prisma.achievement.findUnique({
    where: { id: params.id },
  });
  if (!achievement) {
    return NextResponse.json({ error: "Không tìm thấy thành tích" }, { status: 404 });
  }
  return NextResponse.json(achievement);
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
  const { level, studentName, evidenceUrl, thankYouUrl } = body;

  if (
    (level !== undefined && !level) ||
    (studentName !== undefined && !studentName.trim()) ||
    (evidenceUrl !== undefined && !evidenceUrl) ||
    (thankYouUrl !== undefined && !thankYouUrl)
  ) {
    return NextResponse.json(
      {
        error:
          "Vui lòng nhập đầy đủ trình độ, tên học viên, ảnh minh chứng và ảnh lời cảm ơn.",
      },
      { status: 400 }
    );
  }

  const achievement = await prisma.achievement.update({
    where: { id: params.id },
    data: {
      ...(level !== undefined ? { level } : {}),
      ...(studentName !== undefined ? { studentName: studentName.trim() } : {}),
      ...(evidenceUrl !== undefined ? { evidenceUrl } : {}),
      ...(thankYouUrl !== undefined ? { thankYouUrl } : {}),
    },
  });

  return NextResponse.json(achievement);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  await prisma.achievement.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
