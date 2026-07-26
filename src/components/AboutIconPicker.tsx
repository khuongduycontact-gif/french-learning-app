"use client";

import { useEffect, useRef, useState } from "react";
import { AboutIcon } from "./AboutIcons";

export default function AboutIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Tìm icon từ kho Iconify (200.000+ biểu tượng, miễn phí, không cần đăng ký) khi
  // người dùng gõ từ khoá - debounce 400ms để tránh gọi API liên tục lúc đang gõ.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(q)}&limit=48`
        );
        const data = await res.json();
        setResults(Array.isArray(data?.icons) ? data.icons : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <label className="mb-1 block text-sm font-medium text-ink">Biểu tượng</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center rounded-lg border border-mist bg-white p-2.5 text-sm text-ink hover:bg-mist/50"
      >
        <AboutIcon name={value} className="h-5 w-5 shrink-0 text-bordeaux" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-72 rounded-xl border border-mist bg-white p-3 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Tìm biểu tượng
          </p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="VD: airplane, coffee, world..."
            className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm"
          />
          {searching && <p className="mt-2 text-xs text-ink/40">Đang tìm...</p>}
          {!searching && results.length > 0 && (
            <div className="mt-2 grid max-h-48 grid-cols-6 gap-2 overflow-y-auto">
              {results.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  title={icon}
                  onClick={() => {
                    onChange(icon);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-center rounded-lg border p-2 transition hover:bg-mist ${
                    value === icon ? "border-bordeaux bg-bordeaux/10" : "border-mist"
                  }`}
                >
                  <AboutIcon name={icon} className="h-5 w-5 text-ink" />
                </button>
              ))}
            </div>
          )}
          {!searching && query.trim() && results.length === 0 && (
            <p className="mt-2 text-xs text-ink/40">Không tìm thấy biểu tượng phù hợp.</p>
          )}
        </div>
      )}
    </div>
  );
}
