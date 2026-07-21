export const dynamic = "force-dynamic";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";
import { enrollmentStatusMap } from "@/lib/enrollmentStatus";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") redirect("/admin");

  const [newestCourses, totalEnrollments] = await Promise.all([
    prisma.course.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.enrollment.count(),
  ]);

  const secondaryCourses =
    totalEnrollments > 0
      ? await prisma.course.findMany({
          where: { published: true, enrollments: { some: {} } },
          orderBy: { enrollments: { _count: "desc" } },
          take: 3,
          include: { _count: { select: { enrollments: true } } },
        })
      : [];

  const secondaryTitle = "Khoá học nhiều người đăng ký nhất";

  // Lấy trạng thái đăng ký của người dùng hiện tại cho các khoá học đang hiển thị,
  // để hiển thị huy hiệu "đã đăng ký / chờ xác nhận..." trên từng CourseCard.
  const shownCourseIds = [...newestCourses, ...secondaryCourses].map((c) => c.id);
  const statusByCourseId = new Map<string, string>();
  if (session?.user && shownCourseIds.length > 0) {
    const myEnrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id, courseId: { in: shownCourseIds } },
      select: { courseId: true, status: true },
    });
    myEnrollments.forEach((e) => statusByCourseId.set(e.courseId, e.status));
  }
  function statusBadgeFor(courseId: string) {
    const status = statusByCourseId.get(courseId);
    return status
      ? enrollmentStatusMap[status as keyof typeof enrollmentStatusMap]
      : undefined;
  }

  return (
    <div className="flex flex-col gap-20">
      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <span className="font-display text-sm italic text-bordeaux">
            Apprendre, c'est grandir
          </span>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Học tiếng Pháp theo lộ trình rõ ràng, từ A1 đến B2
          </h1>
          <div className="ribbon-rule my-6" />
          <p className="max-w-md text-ink/70">
            Français là nền tảng học tiếng Pháp trực tuyến với giáo
            trình được biên soạn theo khung tham chiếu Châu Âu (CEFR). Đăng
            nhập bằng Google, chọn khoá học phù hợp và bắt đầu hành trình chinh
            phục Pháp ngữ ngay hôm nay.
          </p>
          <Link
            href="/courses"
            className="mt-8 inline-block rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
          >
            Khám phá khoá học
          </Link>
        </div>
        <div className="relative aspect-square w-full max-w-[220px] justify-self-center overflow-hidden rounded-full border border-mist bg-white/50 md:justify-self-end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-app.png"
            alt="Français avec Céline"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Khoá học nổi bật
            </h2>
            <div className="ribbon-rule mt-3" />
          </div>
          <Link href="/courses" className="text-sm font-medium text-bordeaux hover:underline">
            Xem tất cả →
          </Link>
        </div>
        {newestCourses.length === 0 ? (
          <p className="text-ink/60">Chưa có khoá học nào được xuất bản.</p>
        ) : (
          <div className="flex flex-col gap-10">
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
                Mới nhất
              </h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newestCourses.map((c) => (
                  <CourseCard key={c.id} course={c as any} statusBadge={statusBadgeFor(c.id)} />
                ))}
              </div>
            </div>
            {secondaryCourses.length > 0 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
                  {secondaryTitle}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {secondaryCourses.map((c) => (
                    <CourseCard key={c.id} course={c as any} statusBadge={statusBadgeFor(c.id)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
