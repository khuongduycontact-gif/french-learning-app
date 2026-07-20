"use client";

import Link from "next/link";
import AuthButton from "./AuthButton";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-parchment shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/admin"
          className="font-display text-xl font-semibold tracking-tight text-ink transition hover:text-bordeaux"
        >
          Quản trị
          <span className="ml-2 font-display text-base italic text-bordeaux">
            Français avec Céline
          </span>
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
