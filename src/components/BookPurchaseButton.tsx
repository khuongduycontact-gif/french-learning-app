"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import type { EnrollmentStatus, PaymentInfo } from "@/types";
import { useToast } from "./Toast";
import PaymentQrModal from "./PaymentQrModal";

export default function BookPurchaseButton({
  bookId,
  bookTitle,
  initialPurchaseId,
  initialStatus,
  initialPayment,
  autoStart,
}: {
  bookId: string;
  bookTitle: string;
  initialPurchaseId: string | null;
  initialStatus: EnrollmentStatus | null;
  initialPayment: PaymentInfo | null;
  autoStart?: boolean;
}) {
  const { data: session, status: authStatus } = useSession();
  const { showToast } = useToast();
  const router = useRouter();

  const [purchaseId, setPurchaseId] = useState(initialPurchaseId);
  const [status, setStatus] = useState<EnrollmentStatus | null>(initialStatus);
  const [payment, setPayment] = useState<PaymentInfo | null>(initialPayment);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    if (!session?.user) {
      signIn("google");
      return;
    }

    if (status === "PENDING_PAYMENT" && payment) {
      setModalOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/book-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Mua sách thất bại, vui lòng thử lại.";
        setError(message);
        showToast(message, "error");
        return;
      }

      setPurchaseId(data.purchase.id);
      setStatus(data.purchase.status);

      if (data.purchase.status === "CONFIRMED") {
        showToast("Đã mở sách miễn phí, chúc bạn đọc vui!", "success");
        router.refresh();
        return;
      }

      setPayment(data.payment);
      setModalOpen(true);
    } catch {
      showToast("Mua sách thất bại, vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPaid() {
    if (!purchaseId) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/book-purchases/${purchaseId}/confirm-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Có lỗi xảy ra, vui lòng thử lại.", "error");
        return;
      }
      setStatus("AWAITING_CONFIRMATION");
      setModalOpen(false);
      showToast("Đã ghi nhận thanh toán, đang chờ xác nhận.", "success");
      router.refresh();
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setConfirming(false);
    }
  }

  // Khi đến từ nút "Mua sách ngay" (trang chủ / trang danh sách sách), tự
  // động kích hoạt luôn quy trình mua để mã QR thanh toán hiện ra ngay.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!autoStart) return;
    if (autoStartedRef.current) return;
    if (authStatus === "loading") return;
    if (status === "CONFIRMED" || status === "AWAITING_CONFIRMATION") return;
    autoStartedRef.current = true;
    handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, authStatus, status]);

  if (status === "CONFIRMED") {
    return (
      <div className="rounded-full bg-ink/5 px-6 py-3 text-center text-sm font-semibold text-ink">
        ✓ Bạn đã mua sách này
      </div>
    );
  }

  if (status === "AWAITING_CONFIRMATION") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-gold/10 px-4 py-3 text-sm font-medium text-ink">
        <svg className="h-4 w-4 shrink-0 text-ink/60" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Đã gửi yêu cầu, đang chờ xác nhận thanh toán
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleStart}
        disabled={loading}
        className="w-full rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
      >
        {loading
          ? "Đang xử lý..."
          : !session?.user
          ? "Đăng nhập để mua sách"
          : status === "PENDING_PAYMENT"
          ? "Tiến hành thanh toán"
          : "Mua sách"}
      </button>
      {status === "PENDING_PAYMENT" && (
        <p className="mt-2 text-center text-xs text-ink/50">
          Bạn chưa hoàn tất thanh toán nên sách chưa được mở khoá
        </p>
      )}
      {error && <p className="mt-2 text-sm text-bordeaux">{error}</p>}

      {payment && (
        <PaymentQrModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          courseTitle={bookTitle}
          eyebrow="Thanh toán mua sách"
          payment={payment}
          confirming={confirming}
          onConfirmPaid={handleConfirmPaid}
        />
      )}
    </div>
  );
}
