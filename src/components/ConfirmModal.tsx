"use client";

// Modal xác nhận dùng chung cho mọi hành động xoá (hoặc hành động nguy hiểm
// khác) trong toàn bộ ứng dụng, thay cho window.confirm() mặc định của
// trình duyệt. Dùng cùng với useToast để báo thành công/thất bại sau khi
// hành động hoàn tất.
//
// Cách dùng:
//   const [target, setTarget] = useState<Achievement | null>(null);
//   const [confirming, setConfirming] = useState(false);
//
//   async function handleConfirmDelete() {
//     if (!target) return;
//     setConfirming(true);
//     try {
//       const res = await fetch(`/api/achievements/${target.id}`, { method: "DELETE" });
//       if (!res.ok) {
//         showToast("Xoá thất bại, vui lòng thử lại.", "error");
//         return;
//       }
//       showToast("Đã xoá thành công!", "success");
//       setTarget(null);
//       ...
//     } catch {
//       showToast("Xoá thất bại, vui lòng thử lại.", "error");
//     } finally {
//       setConfirming(false);
//     }
//   }
//
//   <ConfirmModal
//     open={!!target}
//     title="Xoá thành tích?"
//     message={`Xoá thành tích của "${target?.studentName}"? Hành động này không thể hoàn tác.`}
//     confirming={confirming}
//     onCancel={() => setTarget(null)}
//     onConfirm={handleConfirmDelete}
//   />

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  open,
  title = "Xác nhận xoá",
  message,
  confirmLabel = "Xoá",
  cancelLabel = "Huỷ",
  confirming = false,
  danger = true,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Đang gửi yêu cầu xoá lên server - vô hiệu hoá các nút, đổi nhãn nút xác nhận. */
  confirming?: boolean;
  /** true (mặc định) = nút xác nhận màu đỏ đô (bordeaux) cho hành động phá huỷ dữ liệu. */
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Cho phép nhấn Esc để đóng modal (trừ khi đang xử lý xoá dở dang).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !confirming) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, confirming, onCancel]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onClick={() => {
        if (!confirming) onCancel();
      }}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full text-lg ${
            danger ? "bg-bordeaux/10 text-bordeaux" : "bg-gold/15 text-ink"
          }`}
          aria-hidden="true"
        >
          {danger ? "⚠" : "?"}
        </div>
        <h2 id="confirm-modal-title" className="mt-3.5 font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <p id="confirm-modal-message" className="mt-2 text-sm leading-relaxed text-ink/70">
          {message}
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="w-full rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-mist disabled:opacity-60 sm:w-auto"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            autoFocus
            className={`w-full rounded-full px-5 py-2.5 text-sm font-semibold text-parchment transition disabled:opacity-60 sm:w-auto ${
              danger ? "bg-bordeaux hover:bg-bordeaux/90" : "bg-ink hover:bg-ink/90"
            }`}
          >
            {confirming ? "Đang xoá..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
