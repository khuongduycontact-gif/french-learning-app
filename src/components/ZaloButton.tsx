"use client";

import { usePathname } from "next/navigation";

// Nút Zalo nổi ở góc trái màn hình (đối diện nút từ điển ở góc phải) —
// chỉ hiện ở phía học viên, không hiện trong khu vực quản trị (/admin).
// Bấm vào sẽ mở thẳng cuộc trò chuyện Zalo số 0356935918.
const ZALO_LINK = "https://zalo.me/84356935918";

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <rect width="200" height="200" rx="44" fill="#ffffff" />
      {/* Đuôi bong bóng chat cong ở góc dưới-trái, đặc trưng của icon Zalo */}
      <path
        d="M46 150c-10 14-14 26-8 34 9 11 28 10 44 3-16-2-30-10-36-22-3-6-1-11 0-15z"
        fill="#0068FF"
      />
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="62"
        fill="#0068FF"
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
      className="fixed bottom-5 left-5 z-40 flex h-10 w-10 items-center justify-center"
    >
      {/* Vòng sóng toả ra để thu hút sự chú ý, chỉ mang tính trang trí */}
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-ping rounded-full bg-[#0068FF]/60"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-[#0068FF]/40"
      />
      <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-lg transition duration-200 hover:scale-105">
        <ZaloIcon className="h-full w-full" />
      </span>
    </a>
  );
}
