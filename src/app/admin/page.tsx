import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [courseCount, enrollmentCount, userCount] = await Promise.all([
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.user.count(),
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
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-mist bg-white/60 p-6">
            <p className="text-sm text-ink/60">{s.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
