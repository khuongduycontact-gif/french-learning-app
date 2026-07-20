import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

const statusMap = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "pending" as const },
  AWAITING_CONFIRMATION: { label: "Chờ xác nhận", tone: "waiting" as const },
  CONFIRMED: { label: "Đã kích hoạt", tone: "confirmed" as const },
};

export default async function TaiKhoanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Khoá học của tôi
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>

      {enrollments.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist p-10 text-center text-ink/60">
          Bạn chưa đăng ký khoá học nào.{" "}
          <a href="/courses" className="font-medium text-bordeaux hover:underline">
            Khám phá khoá học ngay
          </a>
          .
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <CourseCard
              key={e.id}
              course={e.course as any}
              statusBadge={statusMap[e.status as keyof typeof statusMap]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
