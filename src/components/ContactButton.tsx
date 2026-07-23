"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

// Nút "Liên hệ" nổi ở góc trái màn hình (đối diện nút từ điển ở góc phải) —
// chỉ hiện ở phía học viên, không hiện trong khu vực quản trị (/admin).
// Bấm vào sẽ mở một menu nhỏ cho học viên chọn liên hệ qua Zalo hoặc Messenger.
const ZALO_LINK = "https://zalo.me/84356935918";
const MESSENGER_LINK = "https://m.me/thu.uyen.909934";

function ZaloIcon() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0068FF]">
      <span className="text-[10px] font-extrabold tracking-tight text-white">Zalo</span>
    </span>
  );
}

function MessengerIcon() {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{
        background: "linear-gradient(135deg, #00B2FF 0%, #006AFF 50%, #B900F9 100%)",
      }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.9 1.44 5.49 3.7 7.19V22l3.38-1.86c.9.25 1.87.38 2.92.38 5.52 0 10-4.15 10-9.26C22 6.15 17.52 2 12 2Zm1.02 12.47-2.55-2.72-4.98 2.72 5.48-5.82 2.6 2.72 4.93-2.72-5.48 5.82Z" />
      </svg>
    </span>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M3 6.5 9.15 10.7a1.5 1.5 0 0 0 1.7 0L17 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="4.5" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function ContactButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-3">
      {open && (
        <div className="w-64 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-mist bg-white shadow-xl">
          <div className="flex items-center justify-between bg-ink px-4 py-2.5">
            <p className="text-sm font-semibold text-parchment">Liên hệ với chúng tôi</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-parchment/70 transition hover:text-parchment"
              aria-label="Đóng liên hệ"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1.5 px-3 py-3">
            <a
              href={ZALO_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink transition hover:bg-mist/60"
            >
              <ZaloIcon />
              Nhắn tin qua Zalo
            </a>
            <a
              href={MESSENGER_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink transition hover:bg-mist/60"
            >
              <MessengerIcon />
              Nhắn tin qua Messenger
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#0055A4] text-white shadow-lg transition hover:bg-[#0055A4]/90"
        aria-label={open ? "Đóng liên hệ" : "Mở liên hệ"}
        title="Liên hệ"
      >
        {!open && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#0055A4]/50"
          />
        )}
        <span className="relative">{open ? "✕" : <ContactIcon />}</span>
      </button>
    </div>
  );
}
