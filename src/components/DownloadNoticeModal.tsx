"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function DownloadNoticeModal({
  open,
  hours,
  confirming,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  hours: number;
  confirming: boolean;
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

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-bordeaux">
          Lưu ý thời gian nộp bài
        </p>
        <h2 className="mt-1 font-body text-xl font-semibold text-ink">
          Bạn cần nộp bài trong {hours} tiếng
        </h2>
        <p className="mt-3 text-sm text-ink/70">
          Kể từ thời điểm bạn tải tài liệu bài tập này về, bạn có <span className="font-medium text-ink">{hours} tiếng</span> để hoàn thành và nộp bài. Sau thời gian này, tính năng nộp bài cho tài liệu sẽ bị khoá và bạn sẽ không thể nộp bài được nữa (trừ khi giáo viên mở khoá lại).
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="w-full rounded-full bg-bordeaux px-6 py-3 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
          >
            {confirming ? "Đang xử lý..." : "Tôi đã hiểu, tải xuống"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="w-full rounded-full px-6 py-2.5 text-sm font-medium text-ink/60 transition hover:bg-mist"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
