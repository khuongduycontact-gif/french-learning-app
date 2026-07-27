"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "@/components/DatePicker";

export default function AdminDashboardFilter() {
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
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  return (
    <div className="flex w-full flex-wrap items-center gap-4 rounded-2xl border border-mist bg-white/60 px-4 py-3 sm:w-auto">
      <DatePicker
        id="dashboard-from"
        ariaLabel="Từ ngày"
        placeholder="Từ ngày"
        value={from}
        max={to || undefined}
        onChange={(v) => updateParams({ from: v })}
        className="min-w-0 flex-1 sm:flex-none"
      />

      <span className="hidden text-ink/30 sm:inline">—</span>

      <DatePicker
        id="dashboard-to"
        ariaLabel="Đến ngày"
        placeholder="Đến ngày"
        value={to}
        min={from || undefined}
        onChange={(v) => updateParams({ to: v })}
        className="min-w-0 flex-1 sm:flex-none"
      />

      {(from || to) && (
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm font-medium text-bordeaux hover:underline"
        >
          Xoá lọc
        </button>
      )}
    </div>
  );
}
