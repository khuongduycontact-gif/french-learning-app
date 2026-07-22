"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Achievement } from "@/types";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

const LEVEL_OPTIONS = [
  { value: "", label: "Tất cả trình độ" },
  { value: "A1", label: "A1 · Mới bắt đầu" },
  { value: "A2", label: "A2 · Sơ cấp" },
  { value: "B1", label: "B1 · Trung cấp" },
  { value: "B2", label: "B2 · Trung cao cấp" },
  { value: "C1", label: "C1 · Cao cấp" },
];

export default function AdminAchievementsPage() {
  const { showToast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (level) params.set("level", level);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/achievements?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách thành tích.");
          return res.json();
        })
        .then((data) => {
          setAchievements(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách thành tích, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }

    const t = setTimeout(run, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [level, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(achievements.length / PAGE_SIZE));
  const pageAchievements = achievements.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Xoá thành tích của "${name}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/achievements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Xoá thành tích thất bại, vui lòng thử lại.", "error");
        return;
      }
      setAchievements((prev) => {
        const next = prev.filter((a) => a.id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, nextTotalPages));
        return next;
      });
      showToast("Đã xoá thành tích thành công!", "success");
    } catch {
      showToast("Xoá thành tích thất bại, vui lòng thử lại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Thành tích học viên</h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <Link
          href="/admin/achievements/new"
          className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-bordeaux/90"
        >
          + Thêm thành tích
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-full border border-mist bg-white px-5 py-2.5 text-sm"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Ảnh minh chứng</th>
              <th className="px-4 py-3 font-medium">Tên học viên</th>
              <th className="px-4 py-3 font-medium">Trình độ</th>
              <th className="px-4 py-3 font-medium">Ngày thêm</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-2">
                  <Loader label="Đang tải danh sách thành tích..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
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
            ) : achievements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Chưa có thành tích nào.
                </td>
              </tr>
            ) : (
              pageAchievements.map((a) => (
                <tr key={a.id} className="border-b border-mist last:border-0">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={a.evidenceUrl}
                      alt=""
                      className="h-12 w-16 rounded-lg border border-mist object-cover"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    <Link
                      href={`/admin/achievements/${a.id}/edit`}
                      className="cell-nowrap hover:underline"
                    >
                      {a.studentName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{a.level}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(a.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/achievements/${a.id}/edit`}
                        className="font-medium text-ink hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id, a.studentName)}
                        disabled={deletingId === a.id}
                        className="font-medium text-bordeaux hover:underline disabled:opacity-50"
                      >
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
