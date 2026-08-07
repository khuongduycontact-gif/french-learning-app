"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks, isAdminNavActive } from "@/lib/adminNav";
import AdminNavIcon from "./AdminNavIcons";

const STORAGE_KEY = "admin-sidebar-collapsed";
// Dùng chung điểm ngắt "md" của Tailwind (768px) để phân biệt mobile/tablet dọc
// với desktop/tablet ngang.
const MOBILE_QUERY = "(max-width: 767px)";

// Menu quản trị dùng chung 1 kiểu cho mọi kích thước màn hình (pc, tablet, mobile):
// - Desktop/tablet: mặc định mở rộng (hoặc theo lựa chọn đã lưu của người dùng).
// - Mobile: mặc định thu gọn về dạng icon, bấm nút mới mở rộng ra đầy đủ, và
//   tự thu gọn lại sau khi chuyển trang để không chiếm chỗ nội dung.
export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [ready, setReady] = useState(false);

  // Xác định loại thiết bị + trạng thái thu gọn ban đầu, và theo dõi khi
  // người dùng xoay màn hình / thay đổi kích thước cửa sổ qua lại giữa
  // mobile và desktop.
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);

    const applyState = (mobile: boolean) => {
      setIsMobile(mobile);
      if (mobile) {
        // Trên mobile/tablet nhỏ: luôn mặc định hiển thị dạng icon thu gọn.
        setCollapsed(true);
      } else {
        // Trên desktop: khôi phục lựa chọn đã lưu trước đó của người dùng.
        try {
          setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
        } catch {
          setCollapsed(false);
        }
      }
    };

    applyState(mql.matches);
    setReady(true);

    const handleChange = (e: MediaQueryListEvent) => applyState(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Trên mobile: tự thu gọn lại mỗi khi chuyển trang.
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [pathname, isMobile]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      if (!isMobile) {
        try {
          window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        } catch {
          // localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt...) - bỏ qua.
        }
      }
      return next;
    });
  };

  return (
    <aside
      className={`sticky top-24 z-30 flex h-fit shrink-0 flex-col rounded-2xl border border-mist bg-white/60 p-3 shadow-sm transition-[width] duration-300 ease-out ${
        collapsed ? "w-[76px]" : "w-64"
      } ${ready ? "" : "invisible"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-1 pb-1">
        <p
          className={`min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-ink/50 transition-opacity duration-200 ${
            collapsed ? "pointer-events-none w-0 opacity-0" : "opacity-100"
          }`}
        >
          Quản trị
        </p>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Mở rộng menu quản trị" : "Thu gọn menu quản trị"}
          aria-pressed={collapsed}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink/50 transition hover:bg-mist hover:text-ink"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <path d="M12.5 4.5 7 10l5.5 5.5" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1 text-sm">
        {adminNavLinks.map((link) => {
          const active = isAdminNavActive(pathname, link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? link.label : undefined}
              className={`group relative flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-colors ${
                collapsed ? "justify-center" : "justify-start"
              } ${
                active
                  ? "bg-bordeaux/10 text-bordeaux"
                  : "text-ink/80 hover:bg-mist/70 hover:text-ink"
              }`}
            >
              <AdminNavIcon
                name={link.icon}
                className={`h-5 w-5 shrink-0 transition-colors ${
                  active ? "text-bordeaux" : "text-ink/50 group-hover:text-ink"
                }`}
              />
              <span
                className={`min-w-0 truncate transition-[opacity,max-width] duration-200 ${
                  collapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
                }`}
              >
                {link.label}
              </span>
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-l-full bg-bordeaux"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
