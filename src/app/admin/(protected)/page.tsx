export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatVnd } from "@/lib/format";
import AdminDashboardFilter from "@/components/AdminDashboardFilter";

// Khớp một mốc thời gian với khoảng ngày lọc (undefined = không giới hạn phía đó)
function inRange(date: Date | null | undefined, from?: Date, to?: Date) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  // "from" tính từ 00:00:00 ngày bắt đầu, "to" tính đến 23:59:59 ngày kết thúc
  const from = searchParams.from ? new Date(`${searchParams.from}T00:00:00`) : undefined;
  const to = searchParams.to ? new Date(`${searchParams.to}T23:59:59.999`) : undefined;

  const [courses, enrollments, users, awaitingCount] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, title: true, createdAt: true },
    }),
    prisma.enrollment.findMany({
      select: {
        id: true,
        courseId: true,
        status: true,
        paidAmount: true,
        createdAt: true,
        confirmedAt: true,
      },
    }),
    prisma.user.findMany({ select: { id: true, createdAt: true } }),
    prisma.enrollment.count({ where: { status: "AWAITING_CONFIRMATION" } }),
  ]);

  const filteredCourses = courses.filter((c) => inRange(c.createdAt, from, to));
  const filteredEnrollments = enrollments.filter((e) => inRange(e.createdAt, from, to));
  const filteredUsers = users.filter((u) => inRange(u.createdAt, from, to));

  // Doanh số: chỉ tính tiền của các khoá học ĐÃ ĐƯỢC MỞ KHOÁ (CONFIRMED),
  // tính theo thời điểm admin xác nhận (confirmedAt) để khớp với kỳ lọc.
  const revenue = enrollments
    .filter((e) => e.status === "CONFIRMED" && inRange(e.confirmedAt, from, to))
    .reduce((sum, e) => sum + e.paidAmount, 0);

  const stats = [
    { label: "Khoá học", value: filteredCourses.length },
    { label: "Lượt đăng ký", value: filteredEnrollments.length },
    { label: "Người dùng", value: filteredUsers.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Tổng quan</h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <AdminDashboardFilter />
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

      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-mist bg-white/60 p-6">
            <p className="text-sm text-ink/60">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-mist bg-white/60 p-6">
          <p className="text-sm text-ink/60">Doanh số (khoá học đã mở khoá)</p>
          <p className="mt-2 text-3xl font-semibold text-bordeaux">{formatVnd(revenue)}</p>
        </div>
      </div>
    </div>
  );
}
