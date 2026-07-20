"use client";

import { signIn } from "next-auth/react";

export default function AdminSignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/admin" })}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-ink/90"
    >
      Đăng nhập với Google
    </button>
  );
}
