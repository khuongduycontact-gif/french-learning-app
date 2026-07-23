import Link from "next/link";
import Image from "next/image";
import type { Course } from "@/types";
import { stripRichText } from "@/lib/richtext";
import { isVideoUrl } from "@/lib/media";
import { formatVnd, formatDuration } from "@/lib/format";

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

function HourglassIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

export default function CourseCard({
  course,
  statusBadge,
}: {
  course: Course;
  statusBadge?: { label: string; tone: "pending" | "waiting" | "confirmed" };
}) {
  const hasMedia = Boolean(course.videoUrl);
  const initial = course.title.trim().slice(0, 1).toUpperCase();

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
    <Link href={`/courses/${course.id}`} className="contents">
      {/* Vùng ảnh / minh hoạ đầu thẻ */}
      <div className="relative h-40 w-full overflow-hidden bg-mist">
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
          <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50/70 to-white">
            {/* Hoạ tiết chấm bi góc trên-trái */}
            <div
              className="absolute left-4 top-4 grid grid-cols-4 grid-rows-5 gap-[6px] opacity-40"
              aria-hidden
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="h-[3px] w-[3px] rounded-full bg-indigo-900" />
              ))}
            </div>

            {/* Vệt tròn trang trí góc dưới-trái */}
            <div
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-200/45"
              aria-hidden
            />

            {/* Chữ cái đầu tên khoá học - phông chữ display cỡ lớn */}
            <span className="pointer-events-none absolute left-[16%] top-1/2 -translate-y-1/2 select-none font-display text-7xl font-bold leading-none text-indigo-400">
              {initial}
            </span>

            {/* Minh hoạ tháp Eiffel + skyline + cầu + mây + chim */}
            <svg
              viewBox="0 0 300 200"
              preserveAspectRatio="xMaxYMax meet"
              className="pointer-events-none absolute bottom-0 right-0 h-[95%] w-[64%] text-indigo-400 transition duration-300 group-hover:text-indigo-500"
              aria-hidden
            >
              {/* Mây */}
              <g fill="white">
                <ellipse cx="72" cy="28" rx="26" ry="10" opacity="0.9" />
                <ellipse cx="98" cy="22" rx="18" ry="8" opacity="0.9" />
                <ellipse cx="185" cy="16" rx="22" ry="9" opacity="0.85" />
                <ellipse cx="205" cy="22" rx="15" ry="7" opacity="0.85" />
              </g>

              {/* Chim */}
              <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5">
                <path d="M38 55 q6 -8 12 0 q6 -8 12 0" />
                <path d="M150 38 q5 -7 10 0 q5 -7 10 0" />
              </g>

              {/* Skyline */}
              <g fill="currentColor" opacity="0.22">
                <rect x="184" y="142" width="18" height="43" />
                <rect x="204" y="122" width="14" height="63" />
                <rect x="220" y="150" width="20" height="35" />
                <rect x="242" y="132" width="16" height="53" />
                <rect x="260" y="146" width="23" height="39" />
              </g>

              {/* Cầu */}
              <g stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3">
                <path d="M178 185 q20 -22 40 0" />
                <path d="M213 185 q20 -22 40 0" />
                <line x1="168" y1="185" x2="273" y2="185" />
              </g>

              {/* Tháp Eiffel */}
              <g stroke="currentColor" fill="none" strokeLinejoin="round">
                <path d="M95 186 L140 20 L146 20 L191 186" strokeWidth="2.5" opacity="0.55" />
                <path
                  d="M99 178 L182 178 M103 160 L178 160 M108 140 L173 140 M113 118 L168 118 M119 96 L162 96 M125 74 L156 74 M130 55 L151 55"
                  strokeWidth="1.3"
                  opacity="0.4"
                />
                <path
                  d="M99 178 L143 140 L182 178 M103 160 L143 118 L178 160 M108 140 L143 96 L173 140 M113 118 L143 74 L168 118 M119 96 L143 55 L162 96"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <rect x="118" y="90" width="50" height="8" strokeWidth="1.6" opacity="0.5" />
                <rect x="129" y="45" width="28" height="7" strokeWidth="1.4" opacity="0.55" />
                <line x1="143" y1="20" x2="143" y2="5" strokeWidth="2" opacity="0.6" />
              </g>
            </svg>

            {/* Sóng lượn trang trí đáy */}
            <svg
              viewBox="0 0 300 20"
              preserveAspectRatio="none"
              className="pointer-events-none absolute bottom-3 left-0 h-4 w-full text-indigo-300 opacity-40"
              aria-hidden
            >
              <path
                d="M0 10 Q 25 0 50 10 T 100 10 T 150 10 T 200 10 T 250 10 T 300 10"
                stroke="currentColor"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
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

        <h3 className="line-clamp-1 font-body text-lg font-bold leading-snug text-ink">
          {course.title}
        </h3>

        <p className="line-clamp-2 text-sm text-ink/60">
          {stripRichText(course.description)}
        </p>

        <div className="mt-auto flex items-center gap-2 border-t border-mist pt-3">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-2">
            <TagIcon className="h-4 w-4 shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-ink">
                {course.price > 0 ? formatVnd(course.price) : "Miễn phí"}
              </p>
              <p className="truncate text-[10px] text-ink/50">Học phí</p>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-2">
            <ClockIcon className="h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-emerald-700">
                {formatDuration(course.duration)}
              </p>
              <p className="truncate text-[10px] text-ink/50">Giờ học/buổi học</p>
            </div>
          </div>
        </div>
      </div>
    </Link>

      {/* Nút hành động theo trạng thái đăng ký - luôn nằm dưới cùng của thẻ,
          khớp với đúng trạng thái hiển thị ở trang chi tiết khoá học:
          - Chưa đăng ký: "Đăng ký khoá học ngay" -> mở luôn form đăng ký/QR
          - PENDING_PAYMENT (chưa thanh toán): "Tiến hành thanh toán" -> mở
            lại đúng luồng thanh toán/QR
          - AWAITING_CONFIRMATION (đã thanh toán, chờ admin duyệt): trạng
            thái chờ riêng, không phải "đã đăng ký" - khớp với EnrollButton
            ở trang chi tiết
          - CONFIRMED (đã được admin xác nhận): "Bạn đã đăng ký khoá học này" */}
      <div className="px-4 pb-4">
        {!statusBadge ? (
          <Link
            href={`/courses/${course.id}?enroll=1`}
            className="block w-full rounded-full bg-bordeaux px-4 py-2.5 text-center text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
          >
            Đăng ký khoá học ngay
          </Link>
        ) : statusBadge.tone === "pending" ? (
          <Link
            href={`/courses/${course.id}?enroll=1`}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gold/20 px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-gold/30"
          >
            <WalletIcon className="h-4 w-4" />
            Tiến hành thanh toán
          </Link>
        ) : statusBadge.tone === "waiting" ? (
          <Link
            href={`/courses/${course.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gold/10 px-4 py-2.5 text-center text-sm font-medium text-ink transition hover:bg-gold/20"
          >
            <HourglassIcon className="h-4 w-4 shrink-0 text-ink/60" />
            Đang chờ xác nhận thanh toán
          </Link>
        ) : (
          <Link
            href={`/courses/${course.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            <CheckIcon className="h-4 w-4" />
            Bạn đã đăng ký khoá học này
          </Link>
        )}
      </div>
    </div>
  );
}