"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { sanitizeBlobFilename } from "@/lib/blobFilename";

type Props = {
  label: string;
  value: string;
  onChange: (url: string, fileName?: string) => void;
  error?: string;
};

// Lấy tên tệp từ URL đã tải lên (dùng khi chưa biết tên tệp gốc, VD: đang
// chỉnh sửa sách đã có sẵn tệp).
function fileNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    return decoded.split("/").pop() || "tai-lieu.pdf";
  } catch {
    return "tai-lieu.pdf";
  }
}

export default function PdfUploader({ label, value, onChange, error: externalError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const shownError = error || externalError;

  function handlePick() {
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);

    // Tải thẳng từ trình duyệt lên Vercel Blob (không đi qua server) — tránh
    // giới hạn 4.5MB body request của Vercel Functions vốn hay gặp với PDF
    // dung lượng lớn. Route /api/upload/client chỉ cấp token, không nhận
    // nội dung file.
    try {
      const blob = await upload(
        `bonjour-francais/materials/${sanitizeBlobFilename(file.name)}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/upload/client",
          contentType: file.type || undefined,
          multipart: true,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        }
      );
      onChange(blob.url, file.name);
    } catch (err: any) {
      setError(err?.message || "Tải lên thất bại, vui lòng thử lại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>

      {value && (
        <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-mist bg-white px-3.5 py-2.5">
          <svg className="h-5 w-5 shrink-0 text-bordeaux" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 2.5h7l3 3V16a.9.9 0 0 1-.9.9H5a.9.9 0 0 1-.9-.9V3.4a.9.9 0 0 1 .9-.9Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path d="M12 2.5V6h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <span className="min-w-0 flex-1 truncate text-sm text-ink">{fileNameFromUrl(value)}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-mist disabled:opacity-60"
        >
          {uploading ? `Đang tải lên... ${progress}%` : value ? "Thay thế tệp PDF" : "Chọn tệp PDF"}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm font-medium text-bordeaux hover:underline"
          >
            Xoá
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="hidden"
      />

      {shownError && <p className="mt-1 text-xs text-bordeaux">{shownError}</p>}
    </div>
  );
}
