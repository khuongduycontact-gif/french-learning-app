import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentInfo } from "@/lib/vietqr";
import EnrollButton from "@/components/EnrollButton";
import { RichText } from "@/lib/richtext";

const levelLabel: Record<string, string> = {
  A1: "A1 · Mới bắt đầu",
  A2: "A2 · Sơ cấp",
  B1: "B1 · Trung cấp",
  B2: "B2 · Trung cao cấp",
  C1: "C1 · Cao cấp",
};

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { materials: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") redirect("/admin");

  let enrollment: { id: string; status: string } | null = null;
  if (session?.user) {
    enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
      select: { id: true, status: true },
    });
  }

  const payment =
    enrollment && enrollment.status === "PENDING_PAYMENT"
      ? buildPaymentInfo({ enrollmentId: enrollment.id, amount: course.price })
      : null;

  return (
    <div className="grid gap-10 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-mist">
          {course.videoUrl ? (
            <video
              src={course.videoUrl}
              controls
              poster={course.imageUrl || undefined}
              className="h-full w-full object-cover"
            />
          ) : (
            course.imageUrl && (
              <Image src={course.imageUrl} alt={course.title} fill className="object-cover" />
            )
          )}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-bordeaux">
          {levelLabel[course.level] ?? course.level}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
          {course.title}
        </h1>
        <div className="ribbon-rule my-4" />
        <RichText content={course.description} className="text-ink/80" />
      </div>

      <aside className="h-fit rounded-2xl border border-mist bg-white/60 p-6">
        <div className="mb-4 flex flex-col gap-2 text-sm text-ink">
          <p className="text-lg font-semibold text-ink">
            Giá tiền:{" "}
            {course.price > 0
              ? course.price.toLocaleString("vi-VN") + " vnđ"
              : "Miễn phí"}
          </p>
          <p>
            <span className="font-medium text-ink/70">Số giờ học:</span>{" "}
            {course.duration} giờ
          </p>
          <p>
            <span className="font-medium text-ink/70">Số bài giảng:</span>{" "}
            {course.lessons} bài
          </p>
        </div>
        <EnrollButton
          courseId={course.id}
          courseTitle={course.title}
          initialEnrollmentId={enrollment?.id ?? null}
          initialStatus={(enrollment?.status as any) ?? null}
          initialPayment={payment}
        />

        {enrollment?.status === "CONFIRMED" && course.materials.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-semibold text-ink">
              Tài liệu học
            </h2>
            <div className="ribbon-rule my-3" />
            <ul className="flex flex-col gap-3">
              {course.materials.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col gap-3 rounded-2xl border border-mist bg-white/60 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{m.name}</p>
                    {m.description && (
                      <p className="mt-0.5 text-sm text-ink/60">{m.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {m.files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-3 py-2"
                      >
                        <span className="min-w-0 truncate text-sm text-ink">
                          {f.name || `Tệp ${i + 1}`}
                        </span>
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment transition hover:bg-bordeaux/90"
                        >
                          Tải xuống
                        </a>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
