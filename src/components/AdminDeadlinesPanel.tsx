"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { SubmissionDeadline } from "@/types";
import { isDeadlinePassed, getDeadlineDate } from "@/lib/deadline";
import { formatDateTime } from "@/lib/format";
import Loader from "@/components/Loader";
import DeadlineCountdown from "@/components/DeadlineCountdown";
import { useToast } from "@/components/Toast";

export default function AdminDeadlinesPanel() {
  const { showToast } = useToast();
  const [deadlines, setDeadlines] = useState<SubmissionDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "locked" | "active">("");
  const [search, setSearch] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/deadlines", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được danh sách hạn nộp bài.");
        return res.json();
      })
      .then((data: SubmissionDeadline[]) => {
        setDeadlines(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        setError("Không tải được danh sách hạn nộp bài, vui lòng thử lại.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    deadlines.forEach((d) => {
      if (d.course) map.set(d.course.id, d.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [deadlines]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deadlines.filter((d) => {
      if (courseFilter && d.course?.id !== courseFilter) return false;
      const locked = isDeadlinePassed({ startedAt: d.startedAt, hours: d.hours });
      if (statusFilter === "locked" && !locked) return false;
      if (statusFilter === "active" && locked) return false;
      if (!q) return true;
      const userName = d.user?.name?.toLowerCase() || "";
      const userEmail = d.user?.email?.toLowerCase() || "";
      const courseTitle = d.course?.title?.toLowerCase() || "";
      const materialName = d.material?.name?.toLowerCase() || "";
      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        courseTitle.includes(q) ||
        materialName.includes(q)
      );
    });
  }, [deadlines, courseFilter, statusFilter, search]);

  async function handleReset(id: string) {
    setResettingId(id);
    try {
      const res = await fetch(`/api/deadlines/${id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: 48 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Mở khoá thất bại, vui lòng thử lại.", "error");
        return;
      }
      setDeadlines((prev) => prev.map((d) => (d.id === id ? data : d)));
      showToast("Đã mở khoá & đặt lại 48 giờ cho học viên!", "success");
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink/60">
        Danh sách học viên đã tải/xem tài liệu bài tập, cùng thời gian còn lại để nộp bài (mặc định 48 tiếng kể từ lúc tải). Bấm &quot;Mở khoá&quot; để đặt lại 48 giờ cho học viên nộp bài nếu đã quá hạn.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink focus:border-bordeaux/40 focus:outline-none sm:w-64"
        >
          <option value="">Tất cả khoá học</option>
          {courseOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {[
            { value: "", label: "Tất cả" },
            { value: "active", label: "Còn hạn" },
            { value: "locked", label: "Đã khoá" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value as any)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === f.value ? "bg-bordeaux text-parchment" : "bg-white text-ink hover:bg-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:ml-auto sm:w-[24rem]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm học viên, bài tập..."
            className="w-full rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Học viên</th>
              <th className="px-4 py-3 font-medium">Khoá học</th>
              <th className="px-4 py-3 font-medium">Bài tập</th>
              <th className="px-4 py-3 font-medium">Tải lúc</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-2">
                  <Loader label="Đang tải danh sách..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="text-bordeaux">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
                  >
                    Thử lại
                  </button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  {search || courseFilter || statusFilter
                    ? "Không tìm thấy kết quả phù hợp."
                    : "Chưa có học viên nào tải tài liệu bài tập."}
                </td>
              </tr>
            ) : (
              filtered.map((d) => {
                return (
                  <tr key={d.id} className="border-b border-mist align-top last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {d.user?.image ? (
                          <Image
                            src={d.user.image}
                            alt={d.user.name || ""}
                            width={28}
                            height={28}
                            className="h-7 w-7 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold leading-none text-ink">
                            {d.user?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="cell-nowrap font-medium text-ink">{d.user?.name}</p>
                          <p className="cell-nowrap text-xs text-ink/50">{d.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="cell-nowrap px-4 py-3 font-medium text-ink">{d.course?.title}</td>
                    <td className="cell-nowrap px-4 py-3 text-ink">{d.material?.name}</td>
                    <td className="cell-nowrap px-4 py-3 text-ink/70">{formatDateTime(d.startedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <DeadlineCountdown deadline={{ startedAt: d.startedAt, hours: d.hours }} />
                        <span className="text-xs text-ink/40">
                          Hạn: {formatDateTime(getDeadlineDate({ startedAt: d.startedAt, hours: d.hours }))}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleReset(d.id)}
                        disabled={resettingId === d.id}
                        className="rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment hover:bg-bordeaux/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {resettingId === d.id ? "Đang mở..." : "Mở khoá & đặt lại 48h"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
