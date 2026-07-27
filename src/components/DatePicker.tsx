"use client";

// DatePicker tự dựng thay cho thẻ <input type="date"> gốc - vì phần chữ
// ngày/tháng/năm và popup lịch của input gốc do trình duyệt/hệ điều hành tự
// vẽ, không thể css đồng bộ 100% giữa các trình duyệt (đặc biệt Firefox).
// Component này tự vẽ toàn bộ: nút bấm hiển thị ngày đã chọn + bảng lịch
// popup, dùng chung ngôn ngữ thiết kế (viên nhộng, bordeaux/gold/ink) với
// Select.tsx và .admin-date-input.

import { useEffect, useMemo, useRef, useState } from "react";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const date = parseISODate(value);
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildMonthGrid(viewYear: number, viewMonth: number): Date[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // Thứ 2 = 0
  const start = new Date(viewYear, viewMonth, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export default function DatePicker({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Chọn ngày",
  ariaLabel,
  className = "",
}: {
  id?: string;
  value: string; // "yyyy-mm-dd" hoặc ""
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const today = useMemo(() => new Date(), []);
  const selected = useMemo(() => parseISODate(value), [value]);
  const minDate = useMemo(() => (min ? parseISODate(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseISODate(max) : null), [max]);

  const [viewYear, setViewYear] = useState(() => (selected ?? today).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (selected ?? today).getMonth());
  const [align, setAlign] = useState<"left" | "right">("left");

  const ref = useRef<HTMLDivElement>(null);
  const PANEL_WIDTH = 288; // khớp với w-72 bên dưới

  function handleTriggerClick() {
    if (open) {
      setOpen(false);
      return;
    }
    // Nếu mở lịch bên trái nút mà bị tràn ra ngoài mép phải màn hình
    // (ví dụ nút "Đến ngày" nằm ở nửa phải), mở ngược lại sang bên phải
    // (canh theo mép phải của nút) để lịch luôn nằm gọn trong màn hình.
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const overflowsRight = rect.left + PANEL_WIDTH > window.innerWidth - 16;
      setAlign(overflowsRight ? "right" : "left");
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const base = selected ?? today;
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function isDisabled(date: Date) {
    const d = stripTime(date);
    if (minDate && d < stripTime(minDate)) return true;
    if (maxDate && d > stripTime(maxDate)) return true;
    return false;
  }

  function goPrevMonth() {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function goNextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function pickDay(date: Date) {
    if (isDisabled(date)) return;
    onChange(toISODate(date));
    setOpen(false);
  }

  const grid = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={handleTriggerClick}
        className={`date-picker-trigger flex w-full items-center gap-2 rounded-full border border-mist bg-white px-4 py-2 text-sm shadow-sm transition ${
          value ? "text-ink" : "text-ink/40"
        }`}
      >
        <CalendarGlyph className="h-4 w-4 shrink-0 text-bordeaux/70" />
        <span className="truncate">{value ? formatDisplay(value) : placeholder}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className={`date-picker-panel absolute top-[calc(100%+0.5rem)] z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-mist bg-white p-4 shadow-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <button type="button" onClick={goPrevMonth} aria-label="Tháng trước" className="date-picker-nav">
              <ChevronGlyph className="h-4 w-4 rotate-180" />
            </button>
            <span className="font-body text-sm font-semibold text-ink">
              {MONTH_LABELS[viewMonth]}/{viewYear}
            </span>
            <button type="button" onClick={goNextMonth} aria-label="Tháng sau" className="date-picker-nav">
              <ChevronGlyph className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-ink/40">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-sm">
            {grid.map((date, i) => {
              const inMonth = date.getMonth() === viewMonth;
              const disabled = isDisabled(date);
              const isSelected = !!selected && isSameDay(date, selected);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => pickDay(date)}
                  className={`date-picker-day mx-auto flex h-8 w-8 items-center justify-center rounded-full transition ${
                    !inMonth ? "text-ink/25" : "text-ink"
                  } ${isSelected ? "is-selected" : ""} ${isToday && !isSelected ? "is-today" : ""} ${
                    disabled ? "cursor-not-allowed opacity-30" : "hover:bg-gold/15"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-3 w-full rounded-full border border-mist py-1.5 text-xs font-medium text-bordeaux transition hover:bg-mist/40"
            >
              Xoá ngày đã chọn
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
