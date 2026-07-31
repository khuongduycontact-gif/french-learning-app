"use client";

// Modal xác nhận dùng chung, thay cho confirm() mặc định của trình duyệt
// (không đồng bộ giao diện, không tuỳ biến được). Dùng cho các hành động
// "nguy hiểm" cần admin xác nhận trước khi thực hiện (xoá ca học, xoá khoá
// học, dừng lịch lặp...).

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true (mặc định) -> nút xác nhận màu đỏ/bordeaux, dùng cho hành động phá huỷ (xoá...). */
  danger?: boolean;
  /** true khi hành động đang được xử lý - disable nút, đổi label nút xác nhận. */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-[24px] bg-white p-6 text-center shadow-2xl ring-1 ring-black/5 animate-[confirm-in_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            danger ? "bg-bordeaux/10 text-bordeaux" : "bg-gold/10 text-gold"
          }`}
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A1.5 1.5 0 003.5 20.5h17a1.5 1.5 0 001.4-2.46L13.71 3.86a1.5 1.5 0 00-2.42 0z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 id="confirm-dialog-title" className="mt-3 font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-1.5 text-sm text-ink/60">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-ink hover:bg-mist disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-parchment transition disabled:opacity-60 ${
              danger ? "bg-bordeaux hover:bg-bordeaux/90" : "bg-gold hover:bg-gold/90"
            }`}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes confirm-in {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
