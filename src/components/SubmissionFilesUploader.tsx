"use client";

import { useRef, useState } from "react";
import type { SubmissionFile } from "@/types";

type Props = {
  label: string;
  values: SubmissionFile[];
  onChange: (files: SubmissionFile[]) => void;
  error?: string;
};

function uploadOne(file: File): Promise<SubmissionFile> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/submissions/upload");

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ url: data.url, name: data.fileName || file.name, type: data.fileType || file.type });
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

export default function SubmissionFilesUploader({ label, values, onChange, error: externalError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const shownError = error || externalError;

  function handlePick() {
    inputRef.current?.click();
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError("");
    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const uploaded: SubmissionFile[] = [];
    for (const file of files) {
      try {
        const result = await uploadOne(file);
        uploaded.push(result);
        setProgress((p) => ({ ...p, done: p.done + 1 }));
      } catch (err: any) {
        setError(err?.message || "Tải lên thất bại, vui lòng thử lại.");
      }
    }

    if (uploaded.length > 0) onChange([...values, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      {label && <label className="mb-1 block text-sm font-medium text-ink">{label}</label>}

      {values.length > 0 && (
        <ul className="mb-2 flex flex-col gap-1.5">
          {values.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 rounded-lg border border-mist bg-white px-3 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate text-ink">{f.name || `Tệp ${i + 1}`}</span>
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="shrink-0 text-xs font-medium text-bordeaux hover:underline"
              >
                Xoá
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handlePick}
        disabled={uploading}
        className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-mist disabled:opacity-60"
      >
        {uploading
          ? `Đang tải lên... ${progress.done}/${progress.total}`
          : "Chọn tệp đính kèm"}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {shownError && <p className="mt-1 text-xs text-bordeaux">{shownError}</p>}
    </div>
  );
}
