"use client";

import { useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (status === "loading") {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-mist" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="shrink-0 whitespace-nowrap rounded-full bg-ink px-3 py-2 text-xs font-medium text-parchment transition hover:bg-ink/90 sm:px-4 sm:text-sm"
      >
        <span className="sm:hidden">Đăng nhập</span>
        <span className="hidden sm:inline">Đăng nhập với Google</span>
      </button>
    );
  }

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="block h-9 w-9 overflow-hidden rounded-full border border-mist ring-offset-2 transition hover:ring-2 hover:ring-ink/20"
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "Ảnh đại diện"}
            width={36}
            height={36}
            className="h-9 w-9 object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center bg-mist font-display text-sm font-semibold text-ink">
            {session.user.name?.[0]?.toUpperCase() || "?"}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-[60] w-56 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-mist bg-white shadow-lg"
        >
          <div className="border-b border-mist px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">
              {session.user.name}
            </p>
            <p className="truncate text-xs text-ink/60">{session.user.email}</p>
          </div>
          {session.user.role !== "ADMIN" && (
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center border-b border-mist px-4 py-3 text-left text-sm font-medium text-ink transition hover:bg-mist"
            >
              Khoá học của tôi
            </Link>
          )}
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center px-4 py-3 text-left text-sm font-medium text-bordeaux transition hover:bg-mist"
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
