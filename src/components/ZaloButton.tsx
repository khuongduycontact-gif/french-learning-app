"use client";

import { usePathname } from "next/navigation";

// Nút Zalo nổi ở góc trái màn hình (đối diện nút từ điển ở góc phải) —
// chỉ hiện ở phía học viên, không hiện trong khu vực quản trị (/admin).
// Bấm vào sẽ mở thẳng cuộc trò chuyện Zalo số 0356935918.
// Icon đơn giản: nền trắng, chữ "Zalo" xanh — không phụ thuộc file ảnh nào.
const ZALO_LINK = "https://zalo.me/84356935918";

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
      className="fixed bottom-5 left-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition duration-200 hover:scale-105"
    >
      {/* Vòng sóng toả ra, chỉ 1 màu xanh Zalo, mang tính trang trí */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#0068FF]/60"
      />
      <span className="relative text-[11px] font-extrabold tracking-tight text-[#0068FF]">
        Zalo
      </span>
    </a>
  );
}
