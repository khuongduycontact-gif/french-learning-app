"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function EnrollButton({
  courseId,
  alreadyEnrolled,
}: {
  courseId: string;
  alreadyEnrolled: boolean;
}) {
  const { data: session } = useSession();
  const [enrolled, setEnrolled] = useState(alreadyEnrolled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnroll() {
    if (!session?.user) {
      signIn("google");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đăng ký thất bại, vui lòng thử lại.");
        return;
      }
      setEnrolled(true);
    } finally {
      setLoading(false);
    }
  }

  if (enrolled) {
    return (
      <div className="rounded-full bg-ink/5 px-6 py-3 text-center text-sm font-semibold text-ink">
        ✓ Bạn đã đăng ký khoá học này
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleEnroll}
        disabled={loading}
        className="w-full rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
      >
        {loading
          ? "Đang xử lý..."
          : session?.user
          ? "Đăng ký khoá học"
          : "Đăng nhập để đăng ký"}
      </button>
      {error && <p className="mt-2 text-sm text-bordeaux">{error}</p>}
    </div>
  );
}
