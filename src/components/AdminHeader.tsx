"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-parchment shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10">
        <Link
          href="/admin"
          className="min-w-0 truncate font-display text-lg font-semibold tracking-tight text-ink transition hover:text-bordeaux sm:text-xl"
        >
          <span className="hidden md:inline">Quản trị</span>
          <span className="font-display text-base md:ml-2">
            <span className="not-italic text-ink md:italic md:text-bordeaux">
              Français
            </span>{" "}
            <span className="italic text-bordeaux">avec Céline</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          <NotificationBell />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
