"use client";

import { useEffect, useRef, useState } from "react";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  level: string;
  onLevelChange: (level: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
};

const levelOptions: Option[] = [
  { value: "", label: "Tất cả trình độ" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
];

const sortOptions: Option[] = [
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
  { value: "popular_desc", label: "Đăng ký: Nhiều nhất" },
  { value: "popular_asc", label: "Đăng ký: Ít nhất" },
];

function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative w-full sm:w-auto" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded-2xl border bg-white px-4 text-left text-[15px] font-medium text-ink shadow-sm outline-none transition sm:h-11 sm:min-w-[10.5rem] sm:rounded-full sm:text-sm ${
          open
            ? "border-bordeaux ring-2 ring-bordeaux/20"
            : "border-mist hover:border-ink/30"
        }`}
      >
        <span className="truncate">{current?.label}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-ink/50 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+0.5rem)] z-30 w-full min-w-[12rem] overflow-hidden rounded-2xl border border-mist bg-white py-1.5 shadow-xl sm:w-max"
        >
          {options.map((o) => {
            const selected = o.value === value;
            return (
              <li key={o.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-[15px] transition sm:text-sm ${
                    selected
                      ? "bg-bordeaux/10 font-semibold text-bordeaux"
                      : "text-ink hover:bg-mist/60"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {selected && (
                    <svg
                      className="h-4 w-4 shrink-0"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5L8 14.5L16 6"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function SearchBar({
  value,
  onChange,
  level,
  onLevelChange,
  sort,
  onSortChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
      <div className="relative flex-1 sm:min-w-[14rem]">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm khoá học theo tên hoặc mô tả..."
          className="h-12 w-full rounded-2xl border border-mist bg-white/70 px-5 text-[15px] text-ink placeholder:text-ink/40 outline-none transition focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20 sm:h-11 sm:rounded-full sm:text-sm"
          aria-label="Tìm kiếm khoá học"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <CustomSelect
          value={level}
          onChange={onLevelChange}
          ariaLabel="Lọc theo trình độ"
          options={levelOptions}
        />
        <CustomSelect
          value={sort}
          onChange={onSortChange}
          ariaLabel="Sắp xếp"
          options={sortOptions}
        />
      </div>
    </div>
  );
}
