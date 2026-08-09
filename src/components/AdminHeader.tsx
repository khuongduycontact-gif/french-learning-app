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
            {/* Cùng 2 màu xanh (ink) / đỏ (bordeaux) như logo bên phía
                người dùng (Navbar.tsx) để đồng bộ thương hiệu giữa trang
                quản trị và trang người dùng. */}
            <span className="text-ink">Français</span>{" "}
            <span className="italic text-bordeaux">avec Céline</span>
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
