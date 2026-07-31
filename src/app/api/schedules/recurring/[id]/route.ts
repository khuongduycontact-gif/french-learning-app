import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/schedules/recurring/[id] (chỉ ADMIN)
// Dừng hẳn 1 lịch lặp: đánh dấu active = false (không sinh thêm buổi mới
// nữa) và xoá luôn các buổi đã sinh sẵn nhưng chưa diễn ra. Các buổi đã
// diễn ra trong quá khứ vẫn được giữ lại để lưu lịch sử/thống kê.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const rule = await prisma.recurringSchedule.findUnique({ where: { id: params.id } });
  if (!rule) {
    return NextResponse.json({ error: "Không tìm thấy lịch lặp." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.studentSchedule.deleteMany({
      where: { recurringId: params.id, startTime: { gt: new Date() } },
    }),
    prisma.recurringSchedule.update({
      where: { id: params.id },
      data: { active: false },
    }),
  ]);

  return NextResponse.json({ success: true });
}
