import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/types";
import { stripRichText } from "@/lib/richtext";
import { formatVnd } from "@/lib/format";

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
      <circle
        cx="10"
        cy="10"
        r="7.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 6v4l2.5 2"
        stroke="currentColor"
        strokeWidth="1.5"
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

function BookPlaceholder({ initial }: { initial: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-indigo-100 via-indigo-50/70 to-white">
      <div
        className="absolute left-4 top-4 grid grid-cols-4 grid-rows-5 gap-[6px] opacity-40"
        aria-hidden
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="h-[3px] w-[3px] rounded-full bg-indigo-900"
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-indigo-200/45"
        aria-hidden
      />
      <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-body text-7xl font-bold leading-none text-indigo-400">
        {initial}
      </span>
      <svg
        viewBox="0 0 40 52"
        className="pointer-events-none absolute bottom-3 right-4 h-24 w-auto text-indigo-400/70"
        aria-hidden
      >
        <path
          d="M2 2h30a4 4 0 0 1 4 4v42l-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3-4-3-4 3V6a4 4 0 0 1 2-4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8 11h20M8 18h20M8 25h14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export default function BookCard({
  book,
  statusBadge,
}: {
  book: Book;
  statusBadge?: { label: string; tone: "pending" | "waiting" | "confirmed" };
}) {
  const initial = book.title.trim().slice(0, 1).toUpperCase();

  return (
    // Bọc ngoài (relative, KHÔNG overflow-hidden) chỉ giữ shadow/rounded-2xl/
    // hover - tách riêng khỏi khối overflow-hidden bên trong. Nếu overflow-
    // hidden nằm chung khối với shadow, bóng đổ khi hover sẽ bị cắt/bó hẹp
    // sát viền dưới thẻ thay vì ôm đều quanh thẻ (đồng bộ với BookSlider và
    // TrustedWebsiteSlider - 2 nơi đã tách đúng theo cách này).
    <div className="group relative rounded-2xl shadow-sm transition duration-300 hover:-translate-y-1">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-mist bg-white">
        <Link href={`/books/${book.id}`} className="contents">
          <div className="relative h-48 w-full overflow-hidden bg-white">
            <div className="h-full w-full p-2">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <BookPlaceholder initial={initial} />
                )}
              </div>
            </div>
            {!book.published && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/85 px-2 py-0.5 text-[10px] font-medium text-parchment shadow-sm">
                Bản nháp
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <h3 className="min-w-0 font-body text-sm leading-snug text-ink">
              <span className="font-semibold">Tên sách: </span>
              <span className="font-bold">{book.title}</span>
            </h3>

            <p className="min-w-0 text-sm text-ink/60">
              <span className="font-semibold text-ink">Mô tả: </span>
              {stripRichText(book.description)}
            </p>

            <div className="mt-auto flex items-center gap-2 border-t border-mist pt-3">
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl bg-amber-50 px-2.5 py-2">
                <TagIcon className="h-4 w-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-ink">
                    {book.price > 0 ? formatVnd(book.price) : "Miễn phí"}
                  </p>
                  <p className="truncate text-[10px] text-ink/50">Giá sách</p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Sách miễn phí: không hiện nút "Mua/Đăng ký" nữa, thay bằng nút
          "Xem ngay" dẫn thẳng vào trang chi tiết (trang chi tiết coi sách
          miễn phí như đã sở hữu và cho tải luôn, không cần bấm mua). */}
        <div className="px-4 pb-4">
          {!statusBadge ? (
            book.price > 0 ? (
              <Link
                href={`/books/${book.id}?buy=1`}
                className="block w-full rounded-full bg-bordeaux px-4 py-2.5 text-center text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
              >
                Mua sách ngay
              </Link>
            ) : (
              <Link
                href={`/books/${book.id}`}
                className="block w-full rounded-full bg-bordeaux px-4 py-2.5 text-center text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
              >
                Xem ngay
              </Link>
            )
          ) : statusBadge.tone === "pending" ? (
            <Link
              href={`/books/${book.id}?buy=1`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gold/20 px-4 py-2.5 text-center text-sm font-semibold text-ink transition hover:bg-gold/30"
            >
              <WalletIcon className="h-4 w-4" />
              Tiến hành thanh toán
            </Link>
          ) : statusBadge.tone === "waiting" ? (
            <Link
              href={`/books/${book.id}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-gold/10 px-4 py-2.5 text-center text-sm font-medium text-ink transition hover:bg-gold/20"
            >
              <HourglassIcon className="h-4 w-4 shrink-0 text-ink/60" />
              Đang chờ xác nhận thanh toán
            </Link>
          ) : (
            <Link
              href={`/books/${book.id}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <CheckIcon className="h-4 w-4" />
              Bạn đã mua sách này
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
