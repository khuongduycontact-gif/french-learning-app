"use client";

// Dropdown tự dựng thay cho thẻ <select> gốc - vì phần danh sách lựa chọn
// (popup) của <select> do trình duyệt/hệ điều hành tự vẽ, không thể css
// (bo góc, đổ bóng, tô màu khi hover/đang chọn...). Component này giữ đúng
// hành vi của select (value/onChange, bàn phím, đóng khi click ra ngoài)
// nhưng tự vẽ toàn bộ phần hiển thị để đồng bộ với giao diện chung.

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

export default function Select({
  value,
  onChange,
  options,
  variant = "pill",
  id,
  ariaLabel,
  className = "",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** "pill" (dáng viên nhộng - dùng cho bộ lọc) hoặc "field" (dáng chữ nhật, rộng hết khung - dùng trong form) */
  variant?: "pill" | "field";
  id?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    }
  }

  const selected = options.find((o) => o.value === value);
  const base = variant === "pill" ? "select-pill" : "select-field";

  return (
    <div ref={ref} className={`relative ${variant === "field" ? "w-full" : "inline-block"} ${className}`}>
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        className={`${base} flex w-full items-center justify-between gap-2 text-left`}
      >
        <span className="min-w-0 truncate">{selected?.label ?? ""}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`select-chevron h-3.5 w-3.5 shrink-0 ${open ? "select-chevron-open" : ""}`}
        >
          <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div ref={listRef} role="listbox" className="select-panel scroll-y-fancy">
          {options.length === 0 ? (
            <p className="select-empty">Không có lựa chọn nào</p>
          ) : (
            options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isActive = i === activeIndex;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`select-option ${isSelected ? "select-option-selected" : isActive ? "select-option-active" : ""}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none">
                      <path
                        d="M4 10.5 8 14l8-8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
