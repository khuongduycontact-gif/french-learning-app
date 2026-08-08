"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { BookPurchase, EnrollmentStatus } from "@/types";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { formatVnd } from "@/lib/format";

const PAGE_SIZE = 10;

const statusOrder: Record<EnrollmentStatus, number> = {
  AWAITING_CONFIRMATION: 0,
  PENDING_PAYMENT: 1,
  CONFIRMED: 2,
};

const statusLabel: Record<EnrollmentStatus, { label: string; className: string }> = {
  AWAITING_CONFIRMATION: {
    label: "Chờ xác nhận",
    className: "bg-gold/15 text-ink",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-mist text-ink/60",
  },
  CONFIRMED: {
    label: "Đã mở khoá",
    className: "bg-green-100 text-green-700",
  },
};

const filters: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "AWAITING_CONFIRMATION", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã mở khoá" },
];

export default function AdminBookPurchasesPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [purchases, setPurchases] = useState<BookPurchase[]>([]);
  const [filter, setFilter] = useState(() => searchParams.get("status") || "");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, purchases]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ scope: "admin" });
    if (filter) params.set("status", filter);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/book-purchases?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách lượt mua.");
          return res.json();
        })
        .then((data: BookPurchase[]) => {
          data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
          setPurchases(data);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách lượt mua, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }
    run();
    return () => controller.abort();
  }, [filter, reloadKey]);

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter((p) => {
      const userName = p.user?.name?.toLowerCase() || "";
      const userEmail = p.user?.email?.toLowerCase() || "";
      const bookTitle = p.book?.title?.toLowerCase() || "";
      const note = p.paymentNote?.toLowerCase() || "";
      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        bookTitle.includes(q) ||
        note.includes(q)
      );
    });
  }, [purchases, search]);

  const totalPages = Math.max(1, Math.ceil(filteredPurchases.length / PAGE_SIZE));
  const pagePurchases = filteredPurchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  useEffect(() => {
    if (!highlightId) return;
    const idx = filteredPurchases.findIndex((p) => p.id === highlightId);
    if (idx >= 0) setPage(Math.floor(idx / PAGE_SIZE) + 1);
  }, [highlightId, filteredPurchases]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/book-purchases/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Có lỗi xảy ra, vui lòng thử lại.", "error");
        return;
      }
      setPurchases((prev) =>
        filter
          ? prev.filter((p) => p.id !== id)
          : prev.map((p) => (p.id === id ? { ...p, status: data.status } : p))
      );
      if (filter) {
        setPage((p) => {
          const nextLength = filteredPurchases.filter((x) => x.id !== id).length;
          const nextTotalPages = Math.max(1, Math.ceil(nextLength / PAGE_SIZE));
          return Math.min(p, nextTotalPages);
        });
      }
      showToast(
        action === "approve"
          ? "Đã xác nhận và mở sách cho người mua!"
          : "Đã từ chối yêu cầu, người dùng cần thanh toán lại.",
        "success"
      );
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Mua sách &amp; thanh toán</h1>
        <div className="ribbon-rule mt-3" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === f.value
                  ? "bg-bordeaux text-parchment"
                  : "bg-white text-ink hover:bg-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-[28rem]">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
            viewBox="0 0 20 20"
            fill="none"
          >
            <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên người mua, sách, nội dung CK..."
            className="w-full rounded-full border border-mist bg-white py-2 pl-9 pr-8 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Xoá tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3.5 font-medium">Người mua</th>
              <th className="px-4 py-3.5 font-medium">Sách</th>
              <th className="px-4 py-3.5 font-medium">Số tiền</th>
              <th className="px-4 py-3.5 font-medium">Nội dung CK</th>
              <th className="px-4 py-3.5 font-medium">Trạng thái</th>
              <th className="px-4 py-3.5 font-medium">Thao tác</th>
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
            ) : filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  {search ? "Không tìm thấy kết quả phù hợp." : "Không có yêu cầu nào."}
                </td>
              </tr>
            ) : (
              pagePurchases.map((p) => (
                <tr
                  key={p.id}
                  ref={p.id === highlightId ? highlightRef : undefined}
                  className={`border-b border-mist last:border-0 align-top ${
                    p.id === highlightId ? "bg-gold/10" : ""
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      {p.user?.image ? (
                        <Image
                          src={p.user.image}
                          alt={p.user.name || ""}
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold leading-none text-ink">
                          {p.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="cell-nowrap font-medium text-ink">{p.user?.name}</p>
                        <p className="cell-nowrap text-xs text-ink/50">{p.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-ink">
                    {p.book?.id ? (
                      <Link href={`/admin/books/${p.book.id}/edit`} className="cell-nowrap">
                        {p.book?.title}
                      </Link>
                    ) : (
                      <span className="cell-nowrap">{p.book?.title}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {p.paidAmount > 0 ? formatVnd(p.paidAmount) : "Miễn phí"}
                  </td>
                  <td className="px-4 py-3.5">
                    {p.paymentNote ? (
                      <span className="inline-block max-w-[220px] overflow-x-auto whitespace-nowrap rounded-full bg-mist px-2 py-0.5 font-mono text-xs align-top">
                        {p.paymentNote}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[p.status].className}`}
                    >
                      {statusLabel[p.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {p.status === "AWAITING_CONFIRMATION" ? (
                      <div className="flex justify-start gap-3">
                        <button
                          onClick={() => handleAction(p.id, "reject")}
                          disabled={actingId === p.id}
                          className="font-medium text-bordeaux hover:underline disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAction(p.id, "approve")}
                          disabled={actingId === p.id}
                          className="rounded-full bg-bordeaux px-4 py-1.5 font-semibold text-parchment hover:bg-bordeaux/90 disabled:opacity-50"
                        >
                          Xác nhận
                        </button>
                      </div>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
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
