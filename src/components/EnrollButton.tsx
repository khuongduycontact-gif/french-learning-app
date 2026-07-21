"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import type { EnrollmentStatus, PaymentInfo } from "@/types";
import { useToast } from "./Toast";
import PaymentQrModal from "./PaymentQrModal";

export default function EnrollButton({
  courseId,
  courseTitle,
  initialEnrollmentId,
  initialStatus,
  initialPayment,
  autoStart,
}: {
  courseId: string;
  courseTitle: string;
  initialEnrollmentId: string | null;
  initialStatus: EnrollmentStatus | null;
  initialPayment: PaymentInfo | null;
  autoStart?: boolean;
}) {
  const { data: session, status: authStatus } = useSession();
  const { showToast } = useToast();

  const [enrollmentId, setEnrollmentId] = useState(initialEnrollmentId);
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

    // Đã có lượt đăng ký đang chờ thanh toán -> mở lại QR luôn
    if (status === "PENDING_PAYMENT" && payment) {
      setModalOpen(true);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.error || "Đăng ký thất bại, vui lòng thử lại.";
        setError(message);
        showToast(message, "error");
        return;
      }

      setEnrollmentId(data.enrollment.id);
      setStatus(data.enrollment.status);

      if (data.enrollment.status === "CONFIRMED") {
        showToast("Đăng ký khoá học miễn phí thành công!", "success");
        return;
      }

      setPayment(data.payment);
      setModalOpen(true);
    } catch {
      showToast("Đăng ký thất bại, vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmPaid() {
    if (!enrollmentId) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/enrollments/${enrollmentId}/confirm-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Có lỗi xảy ra, vui lòng thử lại.", "error");
        return;
      }
      setStatus("AWAITING_CONFIRMATION");
      setModalOpen(false);
      showToast("Đã ghi nhận thanh toán, đang chờ cô giáo Céline xác nhận.", "success");
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setConfirming(false);
    }
  }

  // Khi đến từ nút "Đăng ký khoá học ngay" (trang chủ / trang tất cả khoá
  // học), tự động kích hoạt luôn quy trình đăng ký để mã QR thanh toán
  // hiện ra ngay, không cần bấm lại nút "Đăng ký khoá học" ở đây nữa.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!autoStart) return;
    if (autoStartedRef.current) return;
    if (authStatus === "loading") return; // đợi xác định phiên đăng nhập trước
    if (status === "CONFIRMED" || status === "AWAITING_CONFIRMATION") return;
    autoStartedRef.current = true;
    handleStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, authStatus, status]);

  if (status === "CONFIRMED") {
    return (
      <div className="rounded-full bg-ink/5 px-6 py-3 text-center text-sm font-semibold text-ink">
        ✓ Bạn đã đăng ký khoá học này
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
        Đã gửi yêu cầu, đang chờ cô giáo Céline xác nhận thanh toán
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
          ? "Đăng nhập để đăng ký"
          : status === "PENDING_PAYMENT"
          ? "Tiến hành thanh toán"
          : "Đăng ký khoá học"}
      </button>
      {status === "PENDING_PAYMENT" && (
        <p className="mt-2 text-center text-xs text-ink/50">
          Bạn chưa hoàn tất thanh toán nên khoá học chưa được mở khoá
        </p>
      )}
      {error && <p className="mt-2 text-sm text-bordeaux">{error}</p>}

      {payment && (
        <PaymentQrModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          courseTitle={courseTitle}
          payment={payment}
          confirming={confirming}
          onConfirmPaid={handleConfirmPaid}
        />
      )}
    </div>
  );
}
