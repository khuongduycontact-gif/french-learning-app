import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/notifications/:id/read
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const notification = await prisma.notification.findUnique({
    where: { id: params.id },
  });
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Không tìm thấy thông báo" }, { status: 404 });
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true },
  });

  return NextResponse.json(updated);
}
