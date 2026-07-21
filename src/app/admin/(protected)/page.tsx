export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [courseCount, enrollmentCount, userCount, awaitingCount] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count(),
    prisma.enrollment.count({ where: { status: "AWAITING_CONFIRMATION" } }),
  ]);

  const stats = [
    { label: "Khoá học", value: courseCount },
    { label: "Lượt đăng ký", value: enrollmentCount },
    { label: "Người dùng", value: userCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Tổng quan</h1>
        <div className="ribbon-rule mt-3" />
      </div>

      {awaitingCount > 0 && (
        <Link
          href="/admin/enrollments"
          className="flex items-center justify-between gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-5 transition hover:bg-gold/15"
        >
          <div>
            <p className="font-semibold text-ink">
              {awaitingCount} yêu cầu đang chờ xác nhận thanh toán
            </p>
            <p className="text-sm text-ink/60">
              Học viên đã báo đã thanh toán, vào xác nhận để mở khoá học cho họ.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-bordeaux px-4 py-2 text-sm font-semibold text-parchment">
            Xem ngay
          </span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-mist bg-white/60 p-6">
            <p className="text-sm text-ink/60">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
