"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  kind: "image" | "video";
  value: string;
  onChange: (url: string) => void;
};

export default function MediaUploader({ label, kind, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        setProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onChange(data.url);
        } else {
          setError(data.error || "Tải lên thất bại, vui lòng thử lại.");
        }
      } catch {
        setError("Tải lên thất bại, vui lòng thử lại.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Lỗi kết nối, vui lòng thử lại.");
    };

    xhr.send(formData);
    // Cho phép chọn lại cùng một tệp lần nữa nếu cần
    e.target.value = "";
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>

      {value && kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mb-2 h-32 w-full rounded-lg border border-mist object-cover"
        />
      )}
      {value && kind === "video" && (
        <video
          src={value}
          controls
          className="mb-2 h-40 w-full rounded-lg border border-mist bg-black object-contain"
        />
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-mist disabled:opacity-60"
        >
          {uploading ? `Đang tải lên... ${progress}%` : value ? "Thay thế tệp" : "Chọn tệp"}
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
        accept={kind === "image" ? "image/*" : "video/*"}
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-bordeaux">{error}</p>}
    </div>
  );
}
