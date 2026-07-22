import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/achievements?level=A1 (công khai, ai cũng xem được)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level") || undefined;

  const achievements = await prisma.achievement.findMany({
    where: {
      ...(level ? { level: level as any } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(achievements);
}

// POST /api/achievements (chỉ ADMIN)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const body = await req.json();
  const { level, studentName, evidenceUrl, thankYouUrl } = body;

  if (!level || !studentName?.trim() || !evidenceUrl || !thankYouUrl) {
    return NextResponse.json(
      {
        error:
          "Vui lòng nhập đầy đủ trình độ, tên học viên, ảnh minh chứng và ảnh lời cảm ơn.",
      },
      { status: 400 }
    );
  }

  const achievement = await prisma.achievement.create({
    data: {
      level,
      studentName: studentName.trim(),
      evidenceUrl,
      thankYouUrl,
    },
  });

  return NextResponse.json(achievement, { status: 201 });
}
