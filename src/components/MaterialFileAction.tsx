"use client";

import { useState } from "react";
import { getMediaKind } from "@/lib/media";
import SecureMediaViewer from "./SecureMediaViewer";

export default function MaterialFileAction({
  url,
  name,
  type,
  onBeforeAction,
}: {
  url: string;
  name?: string;
  type?: string;
  // Hook tuỳ chọn: chạy trước khi thực sự tải/xem tệp (VD: hiện thông báo
  // hạn nộp bài 48 tiếng và bắt đầu đếm giờ). Trả về false để huỷ hành động.
  onBeforeAction?: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const kind = getMediaKind({ url, type });

  // Tệp không phải ảnh/video (PDF, Word, PowerPoint, file nén...) vẫn cho
  // tải xuống bình thường như trước — nhưng đi qua proxy /api/download để
  // trình duyệt luôn nhận đúng tên tệp, đúng đuôi mở rộng và tải xuống
  // (thay vì Cloudinary trả về thiếu đuôi khiến tệp tải về không mở được).
  if (kind === "other") {
    const downloadHref = `/api/download?url=${encodeURIComponent(
      url
    )}&name=${encodeURIComponent(name || "tai-lieu")}`;

    async function handleClick(e: React.MouseEvent) {
      if (!onBeforeAction) return; // để thẻ <a> tự điều hướng như bình thường
      e.preventDefault();
      setBusy(true);
      try {
        const proceed = await onBeforeAction();
        if (proceed) window.location.href = downloadHref;
      } finally {
        setBusy(false);
      }
    }

    return (
      <a
        href={downloadHref}
        onClick={handleClick}
        aria-disabled={busy}
        className="shrink-0 rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment transition hover:bg-bordeaux/90 aria-disabled:pointer-events-none aria-disabled:opacity-60"
      >
        Tải xuống
      </a>
    );
  }

  // Ảnh/video: chỉ cho xem trực tiếp trong trình xem an toàn, không có liên
  // kết tải về.
  async function handleView() {
    if (onBeforeAction) {
      setBusy(true);
      try {
        const proceed = await onBeforeAction();
        if (!proceed) return;
      } finally {
        setBusy(false);
      }
    }
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleView}
        disabled={busy}
        className="shrink-0 rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
      >
        Xem
      </button>
      {open && (
        <SecureMediaViewer
          url={url}
          name={name}
          kind={kind}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
