"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Book } from "@/types";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import Select from "@/components/Select";
import { formatVnd } from "@/lib/format";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "popular_desc", label: "Số lượt mua: nhiều nhất" },
  { value: "popular_asc", label: "Số lượt mua: ít nhất" },
  { value: "price_asc", label: "Giá: thấp đến cao" },
  { value: "price_desc", label: "Giá: cao đến thấp" },
];

export default function AdminBooksPage() {
  const { showToast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("sort", sort);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/books?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách sách.");
          return res.json();
        })
        .then((data) => {
          setBooks(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách sách, vui lòng thử lại.");
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
  }, [q, sort, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(books.length / PAGE_SIZE));
  const pageBooks = books.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function requestDelete(b: Book) {
    setDeleteTarget(b);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Xoá sách thất bại, vui lòng thử lại.", "error");
        return;
      }
      setBooks((prev) => {
        const next = prev.filter((b) => b.id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, nextTotalPages));
        return next;
      });
      showToast("Đã xoá sách thành công!", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Xoá sách thất bại, vui lòng thử lại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Sách</h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <Link
          href="/admin/books/new"
          className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-bordeaux/90"
        >
          + Thêm sách
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm sách..."
          className="max-w-sm flex-1 rounded-full border border-mist bg-white px-5 py-2.5 text-sm"
        />
        <Select value={sort} onChange={setSort} options={SORT_OPTIONS} />
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3.5 font-medium">Tên sách</th>
              <th className="px-4 py-3.5 font-medium">Giá tiền</th>
              <th className="px-4 py-3.5 font-medium">Lượt mua</th>
              <th className="px-4 py-3.5 font-medium">Trạng thái</th>
              <th className="px-4 py-3.5 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-2">
                  <Loader label="Đang tải danh sách sách..." />
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
            ) : books.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink/50">
                  Chưa có sách nào.
                </td>
              </tr>
            ) : (
              pageBooks.map((b) => (
                <tr key={b.id} className="border-b border-mist last:border-0">
                  <td className="px-4 py-3.5 font-medium text-ink">
                    <Link href={`/admin/books/${b.id}/edit`} className="cell-nowrap">
                      {b.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {b.price > 0 ? formatVnd(b.price) : "Miễn phí"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">{b._count?.purchases ?? 0}</td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.published ? "bg-ink/10 text-ink" : "bg-mist text-ink/60"
                      }`}
                    >
                      {b.published ? "Đã xuất bản" : "Bản nháp"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/books/${b.id}/edit`}
                        className="font-medium text-ink hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => requestDelete(b)}
                        disabled={deletingId === b.id}
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Xoá sách?"
        message={
          <>
            Xoá sách &quot;{deleteTarget?.title}&quot;? Hành động này không thể hoàn tác.
          </>
        }
        confirming={deletingId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
