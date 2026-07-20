import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EnrollButton from "@/components/EnrollButton";

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
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  if (!course) notFound();

  const session = await getServerSession(authOptions);
  if (session?.user?.role === "ADMIN") redirect("/admin");
  let alreadyEnrolled = false;
  if (session?.user) {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
    });
    alreadyEnrolled = !!existing;
  }

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
        <p className="whitespace-pre-line leading-relaxed text-ink/80">
          {course.description}
        </p>
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
            <span className="font-medium text-ink/70">Số buổi học:</span>{" "}
            {course.sessions} buổi
          </p>
          <p>
            <span className="font-medium text-ink/70">Số bài giảng:</span>{" "}
            {course.lessons} bài
          </p>
        </div>
        <EnrollButton courseId={course.id} alreadyEnrolled={alreadyEnrolled} />
      </aside>
    </div>
  );
}
