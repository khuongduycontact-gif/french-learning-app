import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/types";
import { stripRichText } from "@/lib/richtext";
import { isVideoUrl } from "@/lib/media";
import { formatVnd } from "@/lib/format";

const levelLabel: Record<string, string> = {
  A1: "A1 · Mới bắt đầu",
  A2: "A2 · Sơ cấp",
  B1: "B1 · Trung cấp",
  B2: "B2 · Trung cao cấp",
  C1: "C1 · Cao cấp",
};

export default function CourseCard({
  course,
  statusBadge,
}: {
  course: Course;
  statusBadge?: { label: string; tone: "pending" | "waiting" | "confirmed" };
}) {
  const toneClass =
    statusBadge?.tone === "confirmed"
      ? "bg-green-600 text-white"
      : statusBadge?.tone === "waiting"
      ? "bg-gold text-white"
      : "bg-ink/80 text-parchment";

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-mist bg-white/60 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-40 w-full overflow-hidden bg-mist">
        {course.videoUrl && isVideoUrl(course.videoUrl) ? (
          <video
            src={course.videoUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : course.videoUrl ? (
          <Image
            src={course.videoUrl}
            alt={course.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-2xl text-ink/30">
            {course.title.slice(0, 1)}
          </div>
        )}
        {!course.published && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2 py-0.5 text-xs font-medium text-parchment">
            Bản nháp
          </span>
        )}
        {statusBadge && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-medium ${toneClass}`}
          >
            {statusBadge.label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-bordeaux">
          {levelLabel[course.level] ?? course.level}
        </span>
        <h3 className="font-display text-lg font-semibold text-ink">
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm text-ink/70">{stripRichText(course.description)}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-semibold text-ink">
            {course.price > 0
              ? formatVnd(course.price)
              : "Miễn phí"}
          </span>
          <span className="text-ink/50">{course.duration} giờ học</span>
        </div>
      </div>
    </Link>
  );
}
