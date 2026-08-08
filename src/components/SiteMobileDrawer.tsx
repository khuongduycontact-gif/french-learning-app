"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";

// Chỉ tô đậm mục menu khi đang ở đúng trang đó, không tính các trang con
// bên trong (VD: đang xem chi tiết một khoá học ở "/courses/xyz" thì
// không tự động tô đậm "Khoá học" - mặc định không mục nào được chọn).
function isActive(pathname: string | null, href: string) {
  return pathname === href;
}

export default function SiteMobileDrawer({
  session,
}: {
  session: Session | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Chỉ portal ra document.body sau khi đã mount ở client (tránh lỗi SSR
  // vì "document" không tồn tại trên server).
  useEffect(() => {
    setMounted(true);
  }, []);

  // Đóng drawer mỗi khi chuyển trang
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Khoá cuộn nền khi drawer đang mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isAdmin = session?.user?.role === "ADMIN";

  const links = [
    !isAdmin && { href: "/courses", label: "Khoá học" },
    !isAdmin && { href: "/books", label: "Sách" },
    !isAdmin && session?.user && { href: "/account", label: "Khoá học của tôi" },
    !isAdmin && session?.user && { href: "/submissions", label: "Bài tập của tôi" },
    !isAdmin && { href: "/achievements", label: "Thành tích" },
    !isAdmin && { href: "/about", label: "Giới thiệu về Céline" },
    isAdmin && { href: "/admin", label: "Quản trị" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink transition hover:bg-mist md:hidden"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
          <path
            d="M3 5.5h14M3 10h14M3 14.5h14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Lớp phủ + bảng menu được "portal" thẳng ra document.body: header
          cha đang có transform-gpu (chống xé hình khi cuộn trên iOS Safari),
          mà bất kỳ tổ tiên nào có transform cũng sẽ biến thành "khung quy
          chiếu" mới cho mọi phần tử con position:fixed bên trong nó - khiến
          lớp phủ/bảng menu bị định vị theo header (cao ~70px) thay vì theo
          toàn màn hình, dẫn đến hiện tượng menu bị đè/lệch khi trượt ra.
          Portal ra ngoài header sẽ luôn định vị đúng theo viewport. */}
      {mounted &&
        createPortal(
          <>
            {/* Lớp phủ mờ - bấm vào để đóng */}
            <div
              onClick={() => setOpen(false)}
              aria-hidden={!open}
              className={`fixed inset-0 z-[80] bg-ink/50 backdrop-blur-[1px] transition-opacity duration-300 md:hidden ${
                open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            {/* Bảng menu trượt từ trái sang */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className={`fixed inset-y-0 left-0 z-[90] w-[78vw] max-w-64 transform bg-parchment shadow-2xl transition-transform duration-300 ease-out sm:w-72 sm:max-w-80 ${
                open ? "translate-x-0" : "-translate-x-full"
              } md:hidden`}
            >
              <div className="relative flex items-center justify-center gap-2 border-b border-mist px-4 py-4 sm:px-5 sm:py-5">
                <p className="flex min-w-0 flex-wrap items-baseline justify-center gap-1.5 text-center leading-tight">
                  <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                    Français
                  </span>
                  <span className="font-display text-base italic text-bordeaux sm:text-lg">
                    avec Céline
                  </span>
                </p>
              </div>

              <nav className="flex flex-col gap-1 p-3 text-sm sm:p-4">
                {links.map((link) => {
                  const active = isActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`block min-w-0 truncate rounded-lg px-3 py-2.5 font-medium transition ${
                        active ? "bg-bordeaux text-parchment" : "text-ink hover:bg-mist"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
