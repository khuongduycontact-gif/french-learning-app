"use client";

// Tính danh sách số trang hiển thị kiểu rút gọn: 1 ... 4 5 6 ... 15
function getPageList(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const pages: (number | "...")[] = [1];
  if (range[0] > 2) pages.push("...");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pageList = getPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 pt-2 sm:gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Trang trước"
        className="flex h-9 w-7 shrink-0 items-center justify-center text-ink/40 transition hover:text-bordeaux disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-8"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M12.5 15 7.5 10l5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {pageList.map((p, i) =>
        p === "..." ? (
          <span
            key={`dots-${i}`}
            className="px-0.5 text-sm font-semibold text-ink/30 sm:px-1"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition sm:h-10 sm:w-10 ${
              p === page
                ? "bg-bordeaux text-parchment shadow-sm"
                : "border border-mist bg-white text-bordeaux hover:bg-mist"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Trang sau"
        className="flex h-9 w-7 shrink-0 items-center justify-center text-ink/40 transition hover:text-bordeaux disabled:cursor-not-allowed disabled:opacity-30 sm:h-10 sm:w-8"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path
            d="M7.5 5 12.5 10l-5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
