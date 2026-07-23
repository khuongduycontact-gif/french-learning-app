"use client";

import { useState } from "react";
import { getMediaKind } from "@/lib/media";
import SecureMediaViewer from "./SecureMediaViewer";

export default function MaterialFileAction({
  url,
  name,
  type,
  watermarkLabel,
}: {
  url: string;
  name?: string;
  type?: string;
  watermarkLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const kind = getMediaKind({ url, type });

  // Tệp không phải ảnh/video (PDF, Word, PowerPoint, file nén...) vẫn cho
  // tải xuống bình thường như trước — nhưng đi qua proxy /api/download để
  // trình duyệt luôn nhận đúng tên tệp, đúng đuôi mở rộng và tải xuống
  // (thay vì Cloudinary trả về thiếu đuôi khiến tệp tải về không mở được).
  if (kind === "other") {
    const downloadHref = `/api/download?url=${encodeURIComponent(
      url
    )}&name=${encodeURIComponent(name || "tai-lieu")}`;
    return (
      <a
        href={downloadHref}
        className="shrink-0 rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment transition hover:bg-bordeaux/90"
      >
        Tải xuống
      </a>
    );
  }

  // Ảnh/video: chỉ cho xem trực tiếp trong trình xem an toàn, không có liên
  // kết tải về.
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment transition hover:bg-bordeaux/90"
      >
        Xem
      </button>
      {open && (
        <SecureMediaViewer
          url={url}
          name={name}
          kind={kind}
          watermarkLabel={watermarkLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
