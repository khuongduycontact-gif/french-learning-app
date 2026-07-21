"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";
import AdminMobileDrawer from "./AdminMobileDrawer";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-parchment shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <AdminMobileDrawer />
          <Link
            href="/admin"
            className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-ink transition hover:text-bordeaux sm:text-xl"
          >
            <span className="font-display text-base italic text-bordeaux">
              Français avec Céline
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
