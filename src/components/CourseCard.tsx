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

/* --- Icon nhỏ dùng riêng cho thẻ khoá học, vẽ tay bằng SVG để không phải
   thêm thư viện icon mới vào dự án. --- */
function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z"
        fill="currentColor"
      />
      <path
        d="M5 10.5V15c0 1.657 3.134 3 7 3s7-1.343 7-3v-4.5l-7 3.18-7-3.18Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.59 13.41 12 22 2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="13" r="1.4" fill="currentColor" />
    </svg>
  );
}

/* Sắc thái dải ruy băng góc thẻ theo trạng thái đăng ký của học viên.
   - confirmed (đã đăng ký): dấu tick
   - waiting (chờ xác nhận): đồng hồ - đang chờ admin xử lý
   - pending (chờ thanh toán): ví tiền - đang chờ học viên thanh toán */
const ribbonTone: Record<
  "pending" | "waiting" | "confirmed",
  { wedge: string; badge: string; Icon: (p: { className?: string }) => JSX.Element }
> = {
  confirmed: {
    wedge: "from-emerald-400 to-teal-600",
    badge: "text-emerald-600",
    Icon: CheckIcon,
  },
  waiting: {
    wedge: "from-gold to-amber-600",
    badge: "text-amber-600",
    Icon: ClockIcon,
  },
  pending: {
    wedge: "from-ink/70 to-ink",
    badge: "text-ink",
    Icon: WalletIcon,
  },
};

export default function CourseCard({
  course,
  statusBadge,
}: {
  course: Course;
  statusBadge?: { label: string; tone: "pending" | "waiting" | "confirmed" };
}) {
  const tone = statusBadge ? ribbonTone[statusBadge.tone] : null;
  const hasMedia = Boolean(course.videoUrl);
  const initial = course.title.trim().slice(0, 1).toUpperCase();

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Vùng ảnh / minh hoạ đầu thẻ */}
      <div className="relative h-32 w-full overflow-hidden bg-mist">
        {course.videoUrl && isVideoUrl(course.videoUrl) ? (
          <video
            src={course.videoUrl}
            muted
            playsInline
            preload="metadata"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : hasMedia ? (
          <Image
            src={course.videoUrl as string}
            alt={course.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-mist/70 via-parchment to-white">
            {/* Hoạ tiết chấm bi góc trên-trái */}
            <div
              className="absolute left-3 top-3 grid grid-cols-4 grid-rows-3 gap-1 opacity-50"
              aria-hidden
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="h-[3px] w-[3px] rounded-full bg-ink/40" />
              ))}
            </div>
            {/* Vệt tròn trang trí */}
            <div
              className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-bordeaux/5"
              aria-hidden
            />
            {/* Bóng mờ tháp Eiffel - điểm nhấn chủ đề tiếng Pháp */}
            <svg
              viewBox="0 0 120 200"
              className="pointer-events-none absolute -bottom-2 right-2 h-24 w-auto text-ink/10 transition duration-300 group-hover:text-ink/15"
              fill="currentColor"
              aria-hidden
            >
              <path d="M60 0 68 55 98 58 76 88 92 128 66 108 70 200 50 200 54 108 28 128 44 88 22 58 52 55Z" />
            </svg>
            <span className="relative select-none font-display text-5xl font-bold text-ink/15">
              {initial}
            </span>
          </div>
        )}

        {/* Dải ruy băng góc: trạng thái đăng ký của học viên - dạng lá cờ nằm
            ngang phủ ngang góc trên-phải, chữ đọc thẳng (không xoay) cho rõ,
            giống mẫu tham khảo. Miếng nêm bọc tràn ra ngoài mép 1px để khung
            Link ngoài cùng (rounded-2xl, overflow-hidden) cắt gọn, không hở
            nền ảnh phía sau ở góc bo tròn. */}
        {statusBadge && tone && (
          <div className="pointer-events-none absolute right-0 top-0 h-12 w-[62%] max-w-[168px]">
            <div
              className={`absolute -right-1 -top-1 h-[calc(100%+8px)] w-[calc(100%+8px)] bg-gradient-to-br shadow-sm ${tone.wedge}`}
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 24% 100%)" }}
            />
            <div className="relative flex h-full items-center justify-end gap-1.5 pr-3">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <tone.Icon className={`h-2.5 w-2.5 ${tone.badge}`} />
              </span>
              <span className="truncate text-[10px] font-bold uppercase tracking-wide text-white drop-shadow-sm">
                {statusBadge.label}
              </span>
            </div>
          </div>
        )}

        {!course.published && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-parchment shadow-sm">
            Bản nháp
          </span>
        )}
      </div>

      {/* Nội dung thẻ */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-bordeaux/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-bordeaux">
          <GraduationCapIcon className="h-3 w-3" />
          {levelLabel[course.level] ?? course.level}
        </span>

        <h3 className="line-clamp-1 font-display text-base font-bold leading-snug text-ink">
          {course.title}
        </h3>

        <p className="line-clamp-2 text-xs text-ink/60">
          {stripRichText(course.description)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-mist pt-3">
          <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <TagIcon className="h-3.5 w-3.5 text-indigo-500" />
            </span>
            {course.price > 0 ? formatVnd(course.price) : "Miễn phí"}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <ClockIcon className="h-3.5 w-3.5" />
            {course.duration}h
          </span>
        </div>
      </div>
    </Link>
  );
}
