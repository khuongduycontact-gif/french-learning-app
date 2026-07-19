"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import AuthButton from "./AuthButton";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-mist bg-parchment/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Français
          </span>
          <span className="font-display text-xl italic text-bordeaux">
            avec Céline 
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/80 md:flex">
          <Link href="/courses" className="transition hover:text-ink">
            Khoá học
          </Link>
          {session?.user && (
            <Link href="/tai-khoan" className="transition hover:text-ink">
              Khoá học của tôi
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-full bg-ink/5 px-3 py-1 text-ink transition hover:bg-ink/10"
            >
              Quản trị
            </Link>
          )}
        </nav>

        <AuthButton />
      </div>
    </header>
  );
}
