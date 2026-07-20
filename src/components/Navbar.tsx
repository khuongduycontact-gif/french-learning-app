"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-parchment shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href="/"
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
          <NotificationBell />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
