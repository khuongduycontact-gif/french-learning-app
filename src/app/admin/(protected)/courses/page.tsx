"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Course } from "@/types";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 15;

export default function AdminCoursesPage() {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/courses?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách khoá học.");
          return res.json();
        })
        .then((data) => {
          setCourses(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          // Yêu cầu cũ bị huỷ (do gõ tìm kiếm mới) -> bỏ qua, không ghi đè state của yêu cầu mới hơn
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách khoá học, vui lòng thử lại.");
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
  }, [q, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const pageCourses = courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Xoá khoá học "${title}"? Hành động này không thể hoàn tác.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Xoá khoá học thất bại, vui lòng thử lại.", "error");
        return;
      }
      setCourses((prev) => {
        const next = prev.filter((c) => c.id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, nextTotalPages));
        return next;
      });
      showToast("Đã xoá khoá học thành công!", "success");
    } catch {
      showToast("Xoá khoá học thất bại, vui lòng thử lại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Khoá học</h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-bordeaux/90"
        >
          + Thêm khoá học
        </Link>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm khoá học..."
        className="max-w-sm rounded-full border border-mist bg-white px-5 py-2.5 text-sm"
      />

      <div className="overflow-x-auto rounded-2xl border border-mist bg-white/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Tiêu đề</th>
              <th className="px-4 py-3 font-medium">Trình độ</th>
              <th className="px-4 py-3 font-medium">Học phí</th>
              <th className="px-4 py-3 font-medium">Đăng ký</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-2">
                  <Loader label="Đang tải danh sách khoá học..." />
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
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Chưa có khoá học nào.
                </td>
              </tr>
            ) : (
              pageCourses.map((c) => (
                <tr key={c.id} className="border-b border-mist last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{c.title}</td>
                  <td className="px-4 py-3">{c.level}</td>
                  <td className="px-4 py-3">
                    {c.price > 0 ? c.price.toLocaleString("vi-VN") + " đ" : "Miễn phí"}
                  </td>
                  <td className="px-4 py-3">{c._count?.enrollments ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.published ? "bg-ink/10 text-ink" : "bg-mist text-ink/60"
                      }`}
                    >
                      {c.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/courses/${c.id}/edit`}
                        className="font-medium text-ink hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.title)}
                        disabled={deletingId === c.id}
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
