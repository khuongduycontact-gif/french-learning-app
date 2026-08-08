"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TrustedWebsite, TrustedWebsiteInput } from "@/types";
import MediaUploader from "./MediaUploader";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./Toast";

export default function TrustedWebsiteForm({
  initial,
  websiteId,
}: {
  initial?: Partial<TrustedWebsite>;
  websiteId?: string; // nếu có -> chế độ chỉnh sửa
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<TrustedWebsiteInput>({
    name: initial?.name || "",
    link: initial?.link || "",
    description: initial?.description || "",
    coverImage: initial?.coverImage || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof TrustedWebsiteInput, string>>
  >({});

  function update<K extends keyof TrustedWebsiteInput>(key: K, value: TrustedWebsiteInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key] ? { ...f, [key]: undefined } : f));
  }

  function isValidUrl(value: string) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateForm(): Partial<Record<keyof TrustedWebsiteInput, string>> {
    const nextErrors: Partial<Record<keyof TrustedWebsiteInput, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên website.";
    if (!form.link.trim()) nextErrors.link = "Vui lòng nhập link website.";
    else if (!isValidUrl(form.link.trim()))
      nextErrors.link = "Link không hợp lệ, vui lòng nhập đầy đủ (ví dụ: https://...).";
    if (!form.description.trim()) nextErrors.description = "Vui lòng nhập mô tả.";
    return nextErrors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        websiteId ? `/api/trusted-websites/${websiteId}` : "/api/trusted-websites",
        {
          method: websiteId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, link: form.link.trim() }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }
      showToast(
        websiteId ? "Cập nhật website thành công!" : "Thêm website thành công!",
        "success"
      );
      router.push("/admin/trusted-websites");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-2xl flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Tên website</label>
        <input
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Ví dụ: TV5Monde"
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-bordeaux">{fieldErrors.name}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Link website</label>
        <input
          value={form.link}
          onChange={(e) => update("link", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="https://..."
        />
        {fieldErrors.link && <p className="mt-1 text-xs text-bordeaux">{fieldErrors.link}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Mô tả</label>
        <RichTextEditor
          rows={4}
          value={form.description}
          onChange={(next) => update("description", next)}
          placeholder="Giới thiệu ngắn gọn về website này..."
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-bordeaux">{fieldErrors.description}</p>
        )}
      </div>

      <div className="rounded-2xl border border-mist bg-white/60 p-5">
        <MediaUploader
          label="Ảnh bìa website"
          kind="image"
          value={form.coverImage || ""}
          onChange={(url) => update("coverImage", url)}
        />
      </div>

      {error && <p className="text-sm text-bordeaux">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-bordeaux px-6 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : websiteId ? "Lưu thay đổi" : "Thêm website"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-full border border-mist px-6 py-2.5 text-sm font-medium text-ink hover:bg-mist"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
