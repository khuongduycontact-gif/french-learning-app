"use client";

import { usePathname } from "next/navigation";

// Nút Zalo nổi ở góc trái màn hình (đối diện nút từ điển ở góc phải) —
// chỉ hiện ở phía học viên, không hiện trong khu vực quản trị (/admin).
// Bấm vào sẽ mở thẳng cuộc trò chuyện Zalo số 0356935918.
const ZALO_LINK = "https://zalo.me/84356935918";

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="12" fill="#0068FF" />
      <path
        d="M24 11c-7.2 0-13 5.1-13 11.4 0 3.6 1.9 6.8 4.9 8.9-.2 1.5-.9 3.4-1.7 4.7-.2.3.1.7.5.6 2.1-.6 4.4-1.7 5.9-2.6 1.1.3 2.2.4 3.4.4 7.2 0 13-5.1 13-11.4S31.2 11 24 11Z"
        fill="#fff"
      />
      <circle cx="18.5" cy="22.5" r="2" fill="#0068FF" />
      <circle cx="24" cy="22.5" r="2" fill="#0068FF" />
      <circle cx="29.5" cy="22.5" r="2" fill="#0068FF" />
    </svg>
  );
}

export default function ZaloButton() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <a
      href={ZALO_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nhắn tin qua Zalo"
      title="Nhắn tin qua Zalo"
      className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full shadow-lg transition duration-200 hover:scale-105"
    >
      <ZaloIcon className="h-full w-full" />
    </a>
  );
}
