import Image from "next/image";
import { notFound } from "next/navigation";
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
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-2xl font-semibold text-ink">
            {course.price > 0 ? course.price.toLocaleString("vi-VN") + " đ" : "Miễn phí"}
          </span>
          <span className="text-sm text-ink/60">{course.duration} giờ học</span>
        </div>
        <EnrollButton courseId={course.id} alreadyEnrolled={alreadyEnrolled} />
      </aside>
    </div>
  );
}
