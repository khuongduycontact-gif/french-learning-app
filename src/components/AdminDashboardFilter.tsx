"use client";

import { useRouter, useSearchParams } from "next/navigation";

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
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-mist bg-white/60 px-4 py-3">
      <div className="flex items-center gap-2">
        <label htmlFor="dashboard-from" className="text-sm font-medium text-ink/60">
          Từ ngày
        </label>
        <div className="date-input-wrap">
          <input
            id="dashboard-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => updateParams({ from: e.target.value })}
            className="admin-date-input"
          />
        </div>
      </div>

      <span className="hidden text-ink/30 sm:inline">—</span>

      <div className="flex items-center gap-2">
        <label htmlFor="dashboard-to" className="text-sm font-medium text-ink/60">
          Đến ngày
        </label>
        <div className="date-input-wrap">
          <input
            id="dashboard-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => updateParams({ to: e.target.value })}
            className="admin-date-input"
          />
        </div>
      </div>

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
