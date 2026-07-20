"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks, isAdminNavActive } from "@/lib/adminNav";

export default function AdminMobileDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu quản trị"
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
        aria-label="Menu quản trị"
        className={`fixed inset-y-0 left-0 z-[90] w-72 max-w-[80vw] transform bg-parchment shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-mist px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Quản trị
          </p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 transition hover:bg-mist hover:text-ink"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 text-sm">
          {adminNavLinks.map((link) => {
            const active = isAdminNavActive(pathname, link.href, link.exact);
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
    </>
  );
}
