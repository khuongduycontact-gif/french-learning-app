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
  // tải xuống bình thường như trước.
  if (kind === "other") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
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
