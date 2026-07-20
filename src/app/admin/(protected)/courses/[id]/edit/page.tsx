import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseForm from "@/components/CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { materials: { orderBy: { order: "asc" } } },
  });
  if (!course) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Sửa khoá học
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <CourseForm courseId={course.id} initial={course as any} />
    </div>
  );
}
