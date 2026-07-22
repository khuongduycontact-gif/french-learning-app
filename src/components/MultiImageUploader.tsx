"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  // Lỗi validate từ form cha (VD: bắt buộc phải chọn ít nhất 1 ảnh)
  error?: string;
};

export default function MultiImageUploader({ label, values, onChange, error: externalError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const shownError = error || externalError;

  function handlePick() {
    inputRef.current?.click();
  }

  function uploadOne(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data.url);
          } else {
            reject(new Error(data.error || "Tải lên thất bại, vui lòng thử lại."));
          }
        } catch {
          reject(new Error("Tải lên thất bại, vui lòng thử lại."));
        }
      };
      xhr.onerror = () => reject(new Error("Lỗi kết nối, vui lòng thử lại."));
      xhr.send(formData);
    });
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: string[] = [];
    for (const file of files) {
      try {
        const url = await uploadOne(file);
        uploaded.push(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Tải lên thất bại, vui lòng thử lại.");
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    if (uploaded.length > 0) {
      onChange([...values, ...uploaded]);
    }
    setUploading(false);
    e.target.value = "";
  }

  function handleRemove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>

      {values.length > 0 && (
        <div className="mb-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {values.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg border border-mist">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label="Xoá ảnh"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-ink/70 text-xs text-parchment opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePick}
          disabled={uploading}
          className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-mist disabled:opacity-60"
        >
          {uploading
            ? `Đang tải lên... ${progress.done}/${progress.total}`
            : values.length > 0
            ? "Thêm ảnh"
            : "Chọn ảnh"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {shownError && <p className="mt-1 text-xs text-bordeaux">{shownError}</p>}
    </div>
  );
}
