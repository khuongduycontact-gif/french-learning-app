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
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        fontSize="15"
        fill="#fff"
      >
        Zalo
      </text>
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
