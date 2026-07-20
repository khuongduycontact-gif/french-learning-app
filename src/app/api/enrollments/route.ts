import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentInfo, buildPaymentNote } from "@/lib/vietqr";

// GET /api/enrollments -> danh sách khoá học người dùng hiện tại đã đăng ký
// GET /api/enrollments?scope=admin[&status=...] -> (ADMIN) toàn bộ lượt đăng ký
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope");
  const status = searchParams.get("status") || undefined;

  if (scope === "admin") {
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }
    const enrollments = await prisma.enrollment.findMany({
      where: status ? { status: status as any } : {},
      include: {
        course: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(enrollments);
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(enrollments);
}

// POST /api/enrollments { courseId } -> đăng ký khoá học, trả về thông tin thanh toán VietQR
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đăng ký" }, { status: 401 });
  }

  const { courseId } = await req.json();
  if (!courseId) {
    return NextResponse.json({ error: "Thiếu mã khoá học" }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: "Không tìm thấy khoá học" }, { status: 404 });
  }

  try {
    // Khoá học miễn phí -> kích hoạt luôn, không cần thanh toán
    const isFree = course.price <= 0;

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        status: isFree ? "CONFIRMED" : "PENDING_PAYMENT",
        confirmedAt: isFree ? new Date() : null,
      },
    });

    if (isFree) {
      return NextResponse.json({ enrollment, payment: null }, { status: 201 });
    }

    const payment = buildPaymentInfo({ enrollmentId: enrollment.id, amount: course.price });
    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { paidAmount: course.price, paymentNote: buildPaymentNote(enrollment.id) },
    });

    return NextResponse.json({ enrollment: updated, payment }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Bạn đã đăng ký khoá học này rồi" },
        { status: 409 }
      );
    }
    throw e;
  }
}
