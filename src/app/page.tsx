export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

export default async function HomePage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { _count: { select: { enrollments: true } } },
  });

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
            Français avec Céline là nền tảng học tiếng Pháp trực tuyến với giáo
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
        <div className="relative aspect-square w-full max-w-sm justify-self-center rounded-full border border-mist bg-white/50 p-10 md:justify-self-end">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-full border border-dashed border-ink/20 text-center">
            <span className="font-display text-6xl text-ink">Fr</span>
            <span className="text-sm text-ink/60">Bonjour ! Comment ça va ?</span>
          </div>
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
        {courses.length === 0 ? (
          <p className="text-ink/60">Chưa có khoá học nào được xuất bản.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c as any} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
