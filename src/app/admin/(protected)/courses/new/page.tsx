import CourseForm from "@/components/CourseForm";

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Thêm khoá học</h1>
        <div className="ribbon-rule mt-3" />
      </div>
      <CourseForm />
    </div>
  );
}
