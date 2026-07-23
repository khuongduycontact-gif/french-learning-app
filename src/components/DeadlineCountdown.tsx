"use client";

import { useEffect, useState } from "react";
import { formatRemaining, getRemainingMs, isDeadlinePassed, type DeadlineInfo } from "@/lib/deadline";

export default function DeadlineCountdown({ deadline }: { deadline: DeadlineInfo }) {
  const [remaining, setRemaining] = useState(() => getRemainingMs(deadline));

  useEffect(() => {
    setRemaining(getRemainingMs(deadline));
    const id = setInterval(() => setRemaining(getRemainingMs(deadline)), 30_000);
    return () => clearInterval(id);
  }, [deadline.startedAt, deadline.hours]);

  const expired = isDeadlinePassed(deadline);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        expired ? "bg-bordeaux/10 text-bordeaux" : "bg-gold/15 text-ink"
      }`}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {expired ? "Đã hết hạn nộp bài" : `Còn ${formatRemaining(remaining)} để nộp bài`}
    </span>
  );
}
