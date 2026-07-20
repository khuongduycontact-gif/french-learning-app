"use client";

import { useEffect, useRef, useState } from "react";

export type MaterialFileDraft = {
  key: string;
  url: string; // rỗng trong lúc đang tải lên
  type: string;
  name: string;
};

export type MaterialDraft = {
  key: string;
  name: string;
  description: string;
  files: MaterialFileDraft[];
};

type UploadStatus = { uploading: boolean; progress: number; error: string };

function randomKey() {
  return Math.random().toString(36).slice(2);
}

function emptyMaterial(): MaterialDraft {
  return {
    key: randomKey(),
    name: "",
    description: "",
    files: [],
  };
}

// Lấy tên tệp bỏ phần đuôi mở rộng, dùng làm tên tài liệu gợi ý
function stripExtension(filename: string) {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(0, idx) : filename;
}

const ACCEPT =
  "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z";

function fileKindLabel(fileType?: string, fileName?: string) {
  const name = (fileName || "").toLowerCase();
  if (fileType?.startsWith("image/")) return "Ảnh";
  if (fileType?.startsWith("video/")) return "Video";
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".doc") || name.endsWith(".docx")) return "Word";
  if (name.endsWith(".ppt") || name.endsWith(".pptx")) return "PowerPoint";
  if (name.endsWith(".zip") || name.endsWith(".rar") || name.endsWith(".7z"))
    return "File nén";
  return "Tệp";
}

// Danh sách các tệp đã đính kèm / đang tải lên cho 1 tài liệu, cộng với nút
// thêm tệp (hỗ trợ chọn nhiều tệp cùng lúc, tất cả gộp vào tài liệu này).
function MaterialFilesField({
  files,
  statusByKey,
  onSelectFiles,
  onRemoveFile,
}: {
  files: MaterialFileDraft[];
  statusByKey: Record<string, UploadStatus>;
  onSelectFiles: (files: File[]) => void;
  onRemoveFile: (key: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    onSelectFiles(selected);
    e.target.value = "";
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">Tệp tài liệu</label>

      {files.length > 0 && (
        <div className="mb-2 flex flex-col gap-2">
          {files.map((f) => {
            const status = statusByKey[f.key];
            const busy = !!status?.uploading;
            const progress = status?.progress ?? 0;
            return (
              <div key={f.key} className="rounded-lg border border-mist bg-white px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 truncate text-ink">
                    {f.url && !busy && (
                      <span className="shrink-0 rounded-full bg-mist px-2 py-0.5 text-xs font-medium text-ink/70">
                        {fileKindLabel(f.type, f.name)}
                      </span>
                    )}
                    <span className="truncate">
                      {busy ? `Đang tải lên... ${progress}%` : f.name || "Tệp đã tải lên"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(f.key)}
                    disabled={busy}
                    className="shrink-0 text-xs font-medium text-bordeaux hover:underline disabled:opacity-40"
                  >
                    Xoá
                  </button>
                </div>
                {busy && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full rounded-full bg-bordeaux transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                {status?.error && (
                  <p className="mt-1 text-xs text-bordeaux">{status.error}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-mist bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-mist"
      >
        {files.length > 0 ? "+ Thêm tệp" : "Chọn tệp"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      <p className="mt-1 text-xs text-ink/50">
        Có thể chọn nhiều tệp cùng lúc, tất cả sẽ được đính kèm vào tài liệu
        này. Hỗ trợ ảnh, video, Word, PowerPoint, PDF, file nén (.zip, .rar, .7z).
      </p>
    </div>
  );
}

export default function CourseMaterialsEditor({
  value,
  onChange,
}: {
  value: MaterialDraft[];
  onChange: (materials: MaterialDraft[]) => void;
}) {
  // Giữ tham chiếu tới mảng tài liệu mới nhất để dùng an toàn trong các callback
  // bất đồng bộ (upload hoàn tất sau khi component đã re-render nhiều lần).
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const [uploadStatus, setUploadStatus] = useState<Record<string, UploadStatus>>({});

  function updateAt(index: number, patch: Partial<MaterialDraft>) {
    const next = value.map((m, i) => (i === index ? { ...m, ...patch } : m));
    valueRef.current = next;
    onChange(next);
  }

  function removeAt(index: number) {
    const removedKeys = (value[index]?.files || []).map((f) => f.key);
    const next = value.filter((_, i) => i !== index);
    valueRef.current = next;
    onChange(next);
    if (removedKeys.length > 0) {
      setUploadStatus((s) => {
        const rest = { ...s };
        removedKeys.forEach((k) => delete rest[k]);
        return rest;
      });
    }
  }

  function addMaterial() {
    const next = [...value, emptyMaterial()];
    valueRef.current = next;
    onChange(next);
  }

  // Xoá 1 tệp khỏi tài liệu tại index
  function removeFile(materialIndex: number, fileKey: string) {
    const material = valueRef.current[materialIndex];
    if (!material) return;
    updateAt(materialIndex, {
      files: material.files.filter((f) => f.key !== fileKey),
    });
    setUploadStatus((s) => {
      const { [fileKey]: _drop, ...rest } = s;
      return rest;
    });
  }

  // Tải 1 tệp lên và gắn kết quả vào đúng tệp (theo fileKey) trong đúng tài liệu (theo materialKey)
  function uploadFile(materialKey: string, fileKey: string, file: File) {
    setUploadStatus((s) => ({ ...s, [fileKey]: { uploading: true, progress: 0, error: "" } }));

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const progress = Math.round((evt.loaded / evt.total) * 100);
        setUploadStatus((s) => ({ ...s, [fileKey]: { uploading: true, progress, error: "" } }));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          const next = valueRef.current.map((m) =>
            m.key === materialKey
              ? {
                  ...m,
                  files: m.files.map((f) =>
                    f.key === fileKey
                      ? {
                          ...f,
                          url: data.url,
                          type: data.fileType || file.type,
                          name: data.fileName || file.name,
                        }
                      : f
                  ),
                }
              : m
          );
          valueRef.current = next;
          onChange(next);
          setUploadStatus((s) => ({ ...s, [fileKey]: { uploading: false, progress: 100, error: "" } }));
        } else {
          setUploadStatus((s) => ({
            ...s,
            [fileKey]: { uploading: false, progress: 0, error: data.error || "Tải lên thất bại, vui lòng thử lại." },
          }));
        }
      } catch {
        setUploadStatus((s) => ({
          ...s,
          [fileKey]: { uploading: false, progress: 0, error: "Tải lên thất bại, vui lòng thử lại." },
        }));
      }
    };

    xhr.onerror = () => {
      setUploadStatus((s) => ({
        ...s,
        [fileKey]: { uploading: false, progress: 0, error: "Lỗi kết nối, vui lòng thử lại." },
      }));
    };

    xhr.send(formData);
  }

  // Chọn nhiều tệp cùng lúc cho 1 tài liệu -> tất cả gộp vào files[] của
  // đúng tài liệu đó và tải lên song song.
  function handleFilesSelected(materialIndex: number, files: File[]) {
    if (files.length === 0) return;
    const material = valueRef.current[materialIndex];
    if (!material) return;

    const drafts: MaterialFileDraft[] = files.map((file) => ({
      key: randomKey(),
      url: "",
      type: file.type,
      name: file.name,
    }));

    const patch: Partial<MaterialDraft> = { files: [...material.files, ...drafts] };
    // Gợi ý tên tài liệu theo tên tệp đầu tiên nếu người dùng chưa đặt tên
    if (!material.name.trim()) {
      patch.name = stripExtension(files[0].name);
    }
    updateAt(materialIndex, patch);

    drafts.forEach((draft, i) => uploadFile(material.key, draft.key, files[i]));
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-ink">
          Tài liệu học (bắt buộc, tối thiểu 1 tài liệu)
        </label>
      </div>
      <p className="mb-3 text-xs text-ink/50">
        Tài liệu chỉ hiển thị cho học viên sau khi được xác nhận thanh toán.
        Mỗi tài liệu có thể đính kèm nhiều tệp — bấm &quot;Chọn tệp&quot; và
        chọn nhiều tệp cùng lúc để gộp chung vào tài liệu đó.
      </p>

      {value.length > 0 && (
        <div className="mb-3 flex flex-col gap-4">
          {value.map((material, index) => (
            <div
              key={material.key}
              className="flex flex-col gap-3 rounded-2xl border border-mist bg-white/60 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                  Tài liệu #{index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="text-xs font-medium text-bordeaux hover:underline"
                >
                  Xoá tài liệu này
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Tên tài liệu
                </label>
                <input
                  value={material.name}
                  onChange={(e) => updateAt(index, { name: e.target.value })}
                  className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
                  placeholder="Ví dụ: Giáo trình Bài 1 - Chào hỏi"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-ink">
                  Mô tả tài liệu
                </label>
                <textarea
                  rows={2}
                  value={material.description}
                  onChange={(e) => updateAt(index, { description: e.target.value })}
                  className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
                  placeholder="Nội dung ngắn gọn về tài liệu này..."
                />
              </div>

              <MaterialFilesField
                files={material.files}
                statusByKey={uploadStatus}
                onSelectFiles={(files) => handleFilesSelected(index, files)}
                onRemoveFile={(fileKey) => removeFile(index, fileKey)}
              />
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={addMaterial}
        className="rounded-full border border-dashed border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux transition hover:bg-bordeaux/5"
      >
        + {value.length > 0 ? "Thêm tài liệu khác" : "Thêm tài liệu học"}
      </button>
    </div>
  );
}
