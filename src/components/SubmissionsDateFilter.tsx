"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "@/components/DatePicker";

export default function SubmissionsDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  function updateParams(next: { from?: string; to?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextFrom = next.from !== undefined ? next.from : from;
    const nextTo = next.to !== undefined ? next.to : to;

    if (nextFrom) params.set("from", nextFrom);
    else params.delete("from");

    if (nextTo) params.set("to", nextTo);
    else params.delete("to");

    const qs = params.toString();
    router.push(qs ? `/submissions?${qs}` : "/submissions");
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-mist bg-white/60 px-4 py-3">
      <span className="text-sm font-medium text-ink/60">Nộp bài trong khoảng:</span>

      <DatePicker
        id="my-submissions-from"
        ariaLabel="Nộp từ ngày"
        placeholder="Từ ngày"
        value={from}
        max={to || undefined}
        onChange={(v) => updateParams({ from: v })}
      />

      <span className="hidden text-ink/30 sm:inline">—</span>

      <DatePicker
        id="my-submissions-to"
        ariaLabel="Nộp đến ngày"
        placeholder="Đến ngày"
        value={to}
        min={from || undefined}
        onChange={(v) => updateParams({ to: v })}
      />

      {(from || to) && (
        <button
          type="button"
          onClick={() => router.push("/submissions")}
          className="text-sm font-medium text-bordeaux hover:underline"
        >
          Xoá lọc
        </button>
      )}
    </div>
  );
}
