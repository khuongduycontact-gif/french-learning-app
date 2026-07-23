"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-parchment shadow-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4 md:px-10">
        <div className="flex min-w-0 items-center gap-8">
          {/* Trang chủ render động theo trạng thái đăng ký (huy hiệu "đã
              đăng ký"/"chờ xác nhận"...). Next.js Link tự động prefetch "/"
              ngay khi Navbar mount (kể cả khi đang ở trang khoá học, trước
              lúc thanh toán/xác nhận), và bản prefetch đó không bị buộc
              fetch lại chỉ bằng staleTimes.dynamic=0 trong next.config.js.
              => tắt prefetch + ép router.refresh() khi bấm để luôn lấy
              trạng thái mới nhất từ server, không cần tải lại cả trang. */}
          <Link
            href="/"
            prefetch={false}
            onClick={() => router.refresh()}
            className="flex shrink-0 flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-2"
          >
            <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
              Français
            </span>
            <span className="font-display text-base italic text-bordeaux sm:text-xl">
              avec Céline
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-ink/80 md:flex">
            {session?.user?.role !== "ADMIN" && (
              <Link
                href="/courses"
                className={`transition hover:text-ink ${
                  isActive("/courses") ? "font-semibold text-bordeaux" : ""
                }`}
              >
                Khoá học
              </Link>
            )}
            {session?.user?.role !== "ADMIN" && (
              <Link
                href="/achievements"
                className={`transition hover:text-ink ${
                  isActive("/achievements") ? "font-semibold text-bordeaux" : ""
                }`}
              >
                Thành tích
              </Link>
            )}
            {session?.user && session.user.role !== "ADMIN" && (
              <Link
                href="/submissions"
                className={`transition hover:text-ink ${
                  isActive("/submissions") ? "font-semibold text-bordeaux" : ""
                }`}
              >
                Bài tập của tôi
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`rounded-full px-3 py-1 text-ink transition hover:bg-ink/10 ${
                  isActive("/admin") ? "bg-ink/10 font-semibold" : "bg-ink/5"
                }`}
              >
                Quản trị
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell compensateCenteredHeader />
          <AuthButton compensateCenteredHeader />
        </div>
      </div>
    </header>
  );
}
