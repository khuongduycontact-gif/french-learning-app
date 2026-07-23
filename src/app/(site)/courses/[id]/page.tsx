import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildPaymentInfo } from "@/lib/vietqr";
import EnrollButton from "@/components/EnrollButton";
import MaterialsPager from "@/components/MaterialsPager";
import { RichText } from "@/lib/richtext";
import { isVideoUrl } from "@/lib/media";
import { formatVnd, formatDuration } from "@/lib/format";

type MaterialFile = { url: string; name?: string; type?: string };

function getMaterialFiles(files: unknown): MaterialFile[] {
  return Array.isArray(files) ? (files as MaterialFile[]) : [];
}

const levelLabel: Record<string, string> = {
  A1: "A1 · Mới bắt đầu",
  A2: "A2 · Sơ cấp",
  B1: "B1 · Trung cấp",
  B2: "B2 · Trung cao cấp",
  C1: "C1 · Cao cấp",
};

/* --- Icon dùng riêng cho banner khoá học, đồng bộ phong cách với CourseCard
   (thẻ khoá học ở trang chủ/danh sách) để trang chi tiết trông liền mạch
   với "ảnh mẫu" thẻ khoá học. --- */
function GraduationCapIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3 1 8l11 5 9-4.09V17h2V8L12 3Z" fill="currentColor" />
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

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { enroll?: string };
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

  const hasMedia = Boolean(course.videoUrl);
  const initial = course.title.trim().slice(0, 1).toUpperCase();

  return (
    <div className="grid gap-8 md:grid-cols-3 md:items-stretch">
      {/* Cột chính: banner + nội dung khoá học, theo đúng phong cách thẻ
          khoá học mẫu (chấm bi, minh hoạ tháp Eiffel, huy hiệu trạng thái). */}
      <div className="md:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-mist sm:aspect-[21/9]">
            {course.videoUrl && isVideoUrl(course.videoUrl) ? (
              <video
                src={course.videoUrl}
                controls
                className="h-full w-full object-cover"
              />
            ) : hasMedia ? (
              <Image src={course.videoUrl as string} alt={course.title} fill className="object-cover" />
            ) : (
              <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50/70 to-white">
                {/* Hoạ tiết chấm bi góc trên-trái */}
                <div
                  className="absolute left-6 top-6 grid grid-cols-4 grid-rows-5 gap-x-6 gap-y-3 opacity-50 sm:left-8 sm:top-8 sm:gap-x-7"
                  aria-hidden
                >
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  ))}
                </div>

                {/* Vệt tròn trang trí góc dưới-trái */}
                <div
                  className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-indigo-200/45"
                  aria-hidden
                />

                {/* Chữ cái đầu tên khoá học */}
                <span className="pointer-events-none absolute left-[16%] top-1/2 -translate-y-1/2 select-none font-display text-8xl font-bold leading-none text-indigo-400 sm:text-9xl">
                  {initial}
                </span>

                {/* Minh hoạ tháp Eiffel + skyline + cầu + mây + chim */}
                <svg
                  viewBox="0 0 300 200"
                  preserveAspectRatio="xMaxYMax meet"
                  className="pointer-events-none absolute bottom-0 right-0 h-[95%] w-[62%] text-indigo-400"
                  aria-hidden
                >
                  <g fill="white">
                    <ellipse cx="72" cy="28" rx="26" ry="10" opacity="0.9" />
                    <ellipse cx="98" cy="22" rx="18" ry="8" opacity="0.9" />
                    <ellipse cx="185" cy="16" rx="22" ry="9" opacity="0.85" />
                    <ellipse cx="205" cy="22" rx="15" ry="7" opacity="0.85" />
                  </g>
                  <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5">
                    <path d="M38 55 q6 -8 12 0 q6 -8 12 0" />
                    <path d="M150 38 q5 -7 10 0 q5 -7 10 0" />
                  </g>
                  <g fill="currentColor" opacity="0.22">
                    <rect x="184" y="142" width="18" height="43" />
                    <rect x="204" y="122" width="14" height="63" />
                    <rect x="220" y="150" width="20" height="35" />
                    <rect x="242" y="132" width="16" height="53" />
                    <rect x="260" y="146" width="23" height="39" />
                  </g>
                  <g stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3">
                    <path d="M178 185 q20 -22 40 0" />
                    <path d="M213 185 q20 -22 40 0" />
                    <line x1="168" y1="185" x2="273" y2="185" />
                  </g>
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
                  className="pointer-events-none absolute bottom-4 left-0 h-4 w-full text-indigo-300 opacity-40"
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
              <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-medium text-parchment shadow-sm">
                Bản nháp
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-indigo-600 sm:text-sm">
              <GraduationCapIcon className="h-4 w-4" />
              {levelLabel[course.level] ?? course.level}
            </span>

            <h1 className="mt-3 font-body text-2xl font-bold text-ink sm:text-3xl">
              {course.title}
            </h1>

            <RichText content={course.description} className="mt-3 text-ink/60" />
          </div>
        </div>
      </div>

      {/* Cột phụ: giá/thời lượng dạng ô màu như ảnh mẫu + tài liệu học.
          Không dùng sticky/max-height ở đây nữa để toàn bộ trang cuộn bình
          thường theo một luồng duy nhất, thay vì cột này bị "ghim" và cuộn
          riêng bên trong. */}
      <div className="flex flex-col gap-6">
        <aside className="rounded-2xl border border-mist bg-white/60 p-6">
          {/* Ô giá tiền / thời lượng - icon nằm trực tiếp trên nền màu,
              không có khung vuông bọc icon, đúng như ảnh mẫu. Chuyển sang
              cột phải để đi kèm luôn với nút đăng ký. */}
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-amber-50 px-3 py-3.5">
              <TagIcon className="h-6 w-6 shrink-0 text-amber-500" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink sm:text-base">
                  {course.price > 0 ? formatVnd(course.price) : "Miễn phí"}
                </p>
                <p className="truncate text-[11px] text-ink/50">Học phí</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-emerald-50 px-3 py-3.5">
              <ClockIcon className="h-6 w-6 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-emerald-700 sm:text-base">
                  {formatDuration(course.duration)}
                </p>
                <p className="truncate text-[11px] text-ink/50">Giờ học/buổi học</p>
              </div>
            </div>
          </div>

          <p className="mt-4 border-t border-mist pt-4 text-sm text-ink/70">
            <span className="font-medium text-ink/70">Số bài giảng:</span> {course.lessons} bài
          </p>

          <div className="mt-4">
            <EnrollButton
              courseId={course.id}
              courseTitle={course.title}
              initialEnrollmentId={enrollment?.id ?? null}
              initialStatus={(enrollment?.status as any) ?? null}
              initialPayment={payment}
              autoStart={searchParams?.enroll === "1"}
            />
          </div>
        </aside>

        {enrollment?.status === "CONFIRMED" && course.materials.length > 0 && (
          <div className="flex flex-col rounded-2xl border border-mist bg-white/60 p-6">
            <h2 className="shrink-0 font-display text-xl font-semibold text-ink">
              Tài liệu học
            </h2>
            <div className="ribbon-rule my-3 shrink-0" />
            <MaterialsPager
              materials={course.materials.map((m) => ({
                id: m.id,
                name: m.name,
                description: m.description,
                files: getMaterialFiles(m.files),
              }))}
              watermarkLabel={session?.user?.email ?? undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
