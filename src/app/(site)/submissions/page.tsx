import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubmissionCard from "@/components/SubmissionCard";
import SubmissionsDateFilter from "@/components/SubmissionsDateFilter";
import type { Submission } from "@/types";

export default async function MySubmissionsPage({
  searchParams,
}: {
  searchParams: { highlight?: string; from?: string; to?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");

  const from = searchParams?.from;
  const to = searchParams?.to;

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      ...(from || to
        ? {
            submittedAt: {
              ...(from ? { gte: new Date(`${from}T00:00:00`) } : {}),
              ...(to ? { lte: new Date(`${to}T23:59:59.999`) } : {}),
            },
          }
        : {}),
    },
    include: {
      course: { select: { id: true, title: true } },
      material: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  const grouped = new Map<string, { courseTitle: string; items: Submission[] }>();
  for (const s of submissions) {
    const key = s.courseId;
    if (!grouped.has(key)) grouped.set(key, { courseTitle: s.course.title, items: [] });
    grouped.get(key)!.items.push({
      ...s,
      files: s.files as any,
      gradedFiles: s.gradedFiles as any,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      submittedAt: s.submittedAt.toISOString(),
      gradedAt: s.gradedAt ? s.gradedAt.toISOString() : null,
    } as Submission);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Bài tập của tôi</h1>
        <div className="ribbon-rule mt-3" />
        <p className="mt-2 text-sm text-ink/60">
          Theo dõi các bài tập bạn đã nộp và kết quả chữa bài cho từng khoá học.
        </p>
      </div>

      <SubmissionsDateFilter />

      {grouped.size === 0 ? (
        <p className="rounded-2xl border border-mist bg-white/60 p-6 text-center text-ink/50">
          {from || to
            ? "Không có bài nộp nào trong khoảng ngày đã chọn."
            : 'Bạn chưa nộp bài tập nào. Vào phần "Tài liệu học" trong khoá học đã đăng ký để nộp bài.'}
        </p>
      ) : (
        Array.from(grouped.entries()).map(([courseId, group]) => (
          <div key={courseId} className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">{group.courseTitle}</h2>
            <div className="flex flex-col gap-3">
              {group.items.map((s) => (
                <SubmissionCard key={s.id} submission={s} highlighted={s.id === searchParams?.highlight} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
