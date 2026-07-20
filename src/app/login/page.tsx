"use client";

import { signIn } from "next-auth/react";

export default function DangNhapPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment px-6">
      <div className="w-full max-w-sm rounded-2xl border border-mist bg-white/60 p-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Chào mừng trở lại
        </h1>
        <p className="mt-3 mb-6 text-sm text-ink/70">
          Đăng nhập để đăng ký khoá học và theo dõi tiến trình học tập của bạn.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-ink/90"
        >
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}
