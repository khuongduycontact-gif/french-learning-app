"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import { useAdminDrawer } from "./AdminDrawerContext";

export default function AdminHeader() {
  const { isDrawerMode, openDrawer } = useAdminDrawer();

  return (
    <header className="sticky top-0 z-40 transform-gpu border-b border-mist bg-parchment shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-2">
          {isDrawerMode && (
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Mở menu quản trị"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink/60 transition hover:bg-mist/70 hover:text-ink"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
              </svg>
            </button>
          )}
          <Link
            href="/admin"
            className="min-w-0 truncate font-display text-lg font-semibold tracking-tight transition sm:text-xl"
          >
            {/* Màu chữ lấy theo 3 màu lá cờ Pháp (xanh lam - trắng - đỏ),
                chạy gradient trái sang phải qua bg-clip-text. Sắc "trắng"
                dùng tông trắng ngả xanh nhạt (#EAF3FB) thay vì trắng thuần
                vì nền header là màu kem (parchment) - trắng thuần sẽ gần
                như biến mất trên nền đó, còn tông trắng-xanh nhạt vẫn nổi
                rõ nhờ khác tông màu (lạnh) so với nền (ấm). */}
            <span className="bg-gradient-to-r from-[#0055A4] via-[#EAF3FB] to-[#EF4135] bg-clip-text text-transparent">
              Français <span className="italic">avec Céline</span>
            </span>
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <NotificationBell />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
