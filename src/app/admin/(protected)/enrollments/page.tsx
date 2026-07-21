"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Enrollment, EnrollmentStatus } from "@/types";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import { formatVnd } from "@/lib/format";

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

export default function AdminEnrollmentsPage() {
  const { showToast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [actingId, setActingId] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ scope: "admin" });
    if (filter) params.set("status", filter);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/enrollments?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách đăng ký.");
          return res.json();
        })
        .then((data: Enrollment[]) => {
          data.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
          setEnrollments(data);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách đăng ký, vui lòng thử lại.");
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

  async function handleAction(id: string, action: "approve" | "reject") {
    setActingId(id);
    try {
      const res = await fetch(`/api/enrollments/${id}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Có lỗi xảy ra, vui lòng thử lại.", "error");
        return;
      }
      setEnrollments((prev) =>
        filter
          ? prev.filter((e) => e.id !== id)
          : prev.map((e) => (e.id === id ? { ...e, status: data.status } : e))
      );
      showToast(
        action === "approve"
          ? "Đã xác nhận và mở khoá học cho học viên!"
          : "Đã từ chối yêu cầu, học viên cần thanh toán lại.",
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
        <h1 className="font-display text-3xl font-semibold text-ink">
          Đăng ký &amp; thanh toán
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>

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

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Học viên</th>
              <th className="px-4 py-3 font-medium">Khoá học</th>
              <th className="px-4 py-3 font-medium">Số tiền</th>
              <th className="px-4 py-3 font-medium">Nội dung CK</th>
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
            ) : enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Không có yêu cầu nào.
                </td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="border-b border-mist last:border-0 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {e.user?.image ? (
                        <Image
                          src={e.user.image}
                          alt={e.user.name || ""}
                          width={28}
                          height={28}
                          className="h-7 w-7 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold leading-none text-ink">
                          {e.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="cell-nowrap font-medium text-ink">{e.user?.name}</p>
                        <p className="cell-nowrap text-xs text-ink/50">{e.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {e.course?.id ? (
                      <Link
                        href={`/admin/courses/${e.course.id}/edit`}
                        className="cell-nowrap hover:underline"
                      >
                        {e.course?.title}
                      </Link>
                    ) : (
                      <span className="cell-nowrap">{e.course?.title}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {e.paidAmount > 0 ? formatVnd(e.paidAmount) : "Miễn phí"}
                  </td>
                  <td className="px-4 py-3">
                    {e.paymentNote ? (
                      <span className="cell-nowrap rounded-full bg-mist px-2 py-0.5 font-mono text-xs">
                        {e.paymentNote}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[e.status].className}`}
                    >
                      {statusLabel[e.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "AWAITING_CONFIRMATION" ? (
                      <div className="flex justify-start gap-3">
                        <button
                          onClick={() => handleAction(e.id, "reject")}
                          disabled={actingId === e.id}
                          className="font-medium text-bordeaux hover:underline disabled:opacity-50"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAction(e.id, "approve")}
                          disabled={actingId === e.id}
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
    </div>
  );
}
