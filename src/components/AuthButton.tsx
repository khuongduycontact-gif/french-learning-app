"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-24 animate-pulse rounded-full bg-mist" />;
  }

  if (!session?.user) {
    return (
      <button
        onClick={() => signIn("google")}
        className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-parchment transition hover:bg-ink/90"
      >
        Đăng nhập với Google
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || "Ảnh đại diện"}
          width={32}
          height={32}
          className="rounded-full border border-mist"
        />
      )}
      <span className="hidden text-sm font-medium sm:inline">
        {session.user.name}
      </span>
      <button
        onClick={() => signOut()}
        className="rounded-full border border-ink/20 px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-mist"
      >
        Đăng xuất
      </button>
    </div>
  );
}
