"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { TrustedWebsite } from "@/types";
import { useToast } from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 10;

export default function AdminTrustedWebsitesPage() {
  const { showToast } = useToast();
  const [websites, setWebsites] = useState<TrustedWebsite[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrustedWebsite | null>(null);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/trusted-websites?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách website.");
          return res.json();
        })
        .then((data) => {
          setWebsites(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách website, vui lòng thử lại.");
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

  const totalPages = Math.max(1, Math.ceil(websites.length / PAGE_SIZE));
  const pageWebsites = websites.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function requestDelete(w: TrustedWebsite) {
    setDeleteTarget(w);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/trusted-websites/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Xoá website thất bại, vui lòng thử lại.", "error");
        return;
      }
      setWebsites((prev) => {
        const next = prev.filter((w) => w.id !== id);
        const nextTotalPages = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setPage((p) => Math.min(p, nextTotalPages));
        return next;
      });
      showToast("Đã xoá website thành công!", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Xoá website thất bại, vui lòng thử lại.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Website học tiếng Pháp tham khảo
          </h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <Link
          href="/admin/trusted-websites/new"
          className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-parchment hover:bg-bordeaux/90"
        >
          + Thêm website
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm website..."
          className="max-w-sm flex-1 rounded-full border border-mist bg-white px-5 py-2.5 text-sm"
        />
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3.5 font-medium">Ảnh bìa</th>
              <th className="px-4 py-3.5 font-medium">Tên website</th>
              <th className="px-4 py-3.5 font-medium">Link</th>
              <th className="px-4 py-3.5 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-2">
                  <Loader label="Đang tải danh sách website..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
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
            ) : websites.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink/50">
                  Chưa có website nào.
                </td>
              </tr>
            ) : (
              pageWebsites.map((w) => (
                <tr key={w.id} className="border-b border-mist last:border-0">
                  <td className="px-4 py-3.5">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-mist">
                      {w.coverImage ? (
                        <Image
                          src={w.coverImage}
                          alt={w.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-indigo-400">
                          {w.name.trim().slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">
                    <Link href={`/admin/trusted-websites/${w.id}/edit`} className="cell-nowrap">
                      {w.name}
                    </Link>
                  </td>
                  <td className="max-w-[260px] truncate px-4 py-3.5 text-ink/70">
                    <a
                      href={w.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {w.link}
                    </a>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/trusted-websites/${w.id}/edit`}
                        className="font-medium text-ink hover:underline"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => requestDelete(w)}
                        disabled={deletingId === w.id}
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
        title="Xoá website?"
        message={
          <>
            Xoá website &quot;{deleteTarget?.name}&quot;? Hành động này không thể hoàn tác.
          </>
        }
        confirming={deletingId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
