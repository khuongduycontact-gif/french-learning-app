"use client";

import { useRouter, useSearchParams } from "next/navigation";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function AdminDashboardFilter({
  years,
}: {
  // Danh sách năm có dữ liệu (khoá học/đăng ký/người dùng), mới nhất trước
  years: number[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month") || "";
  const year = searchParams.get("year") || "";

  function updateParams(next: { month?: string; year?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const nextMonth = next.month !== undefined ? next.month : month;
    const nextYear = next.year !== undefined ? next.year : year;

    if (nextYear) params.set("year", nextYear);
    else params.delete("year");

    // Lọc theo tháng chỉ có ý nghĩa khi đã chọn năm cụ thể
    if (nextMonth && nextYear) params.set("month", nextMonth);
    else params.delete("month");

    const qs = params.toString();
    router.push(qs ? `/admin?${qs}` : "/admin");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={year}
        onChange={(e) => updateParams({ year: e.target.value })}
        className="rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink"
      >
        <option value="">Mọi thời điểm</option>
        {years.map((y) => (
          <option key={y} value={y}>
            Năm {y}
          </option>
        ))}
      </select>

      <select
        value={month}
        disabled={!year}
        onChange={(e) => updateParams({ month: e.target.value })}
        className="rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Cả năm</option>
        {MONTHS.map((m) => (
          <option key={m} value={m}>
            Tháng {m}
          </option>
        ))}
      </select>

      {(month || year) && (
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
