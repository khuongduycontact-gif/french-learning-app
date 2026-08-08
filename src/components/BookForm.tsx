"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Book, BookInput } from "@/types";
import MediaUploader from "./MediaUploader";
import PdfUploader from "./PdfUploader";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./Toast";

export default function BookForm({
  initial,
  bookId,
}: {
  initial?: Partial<Book>;
  bookId?: string; // nếu có -> chế độ chỉnh sửa
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<BookInput>({
    title: initial?.title || "",
    description: initial?.description || "",
    price: initial?.price ?? 0,
    coverImage: initial?.coverImage || "",
    contentUrl: initial?.contentUrl || "",
    published: initial?.published ?? true,
  });
  // Giá trị hiển thị dạng chữ cho ô giá tiền - tách khỏi form.price để cho
  // phép xoá trắng ô (kể cả số 0 mặc định) trong lúc gõ, không bị tự nhảy về 0.
  const [priceText, setPriceText] = useState(String(initial?.price ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof BookInput, string>>>({});

  function update<K extends keyof BookInput>(key: K, value: BookInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key] ? { ...f, [key]: undefined } : f));
  }

  function updatePrice(raw: string) {
    if (raw === "") {
      setPriceText("");
      update("price", 0);
      return;
    }
    if (!/^\d+$/.test(raw)) return; // chỉ nhận chữ số
    if (/^0{2,}$/.test(raw)) return; // không cho nhập liên tiếp toàn số 0
    const cleaned = raw.replace(/^0+(?=[1-9])/, "");
    const n = parseInt(cleaned, 10);
    setPriceText(cleaned);
    update("price", Number.isNaN(n) ? 0 : Math.max(0, n));
  }

  function handlePriceBlur() {
    if (priceText === "") setPriceText("0");
  }

  function validateForm(): Partial<Record<keyof BookInput, string>> {
    const nextErrors: Partial<Record<keyof BookInput, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tên sách.";
    if (!form.description.trim()) nextErrors.description = "Vui lòng nhập mô tả.";
    if (!form.contentUrl) nextErrors.contentUrl = "Vui lòng tải lên tệp PDF nội dung sách.";
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
      const res = await fetch(bookId ? `/api/books/${bookId}` : "/api/books", {
        method: bookId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }
      showToast(bookId ? "Cập nhật sách thành công!" : "Thêm sách thành công!", "success");
      router.push("/admin/books");
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
        <label className="mb-1 block text-sm font-medium text-ink">Tên sách</label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Ví dụ: Le Petit Prince"
        />
        {fieldErrors.title && <p className="mt-1 text-xs text-bordeaux">{fieldErrors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Mô tả</label>
        <RichTextEditor
          rows={4}
          value={form.description}
          onChange={(next) => update("description", next)}
          placeholder="Giới thiệu nội dung, tác giả, trình độ phù hợp..."
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-bordeaux">{fieldErrors.description}</p>
        )}
      </div>

      <div className="max-w-[220px]">
        <label className="mb-1 block text-sm font-medium text-ink">
          Giá tiền (vnđ, để 0 nếu miễn phí)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={priceText}
          onChange={(e) => updatePrice(e.target.value)}
          onBlur={handlePriceBlur}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
        />
      </div>

      <div className="rounded-2xl border border-mist bg-white/60 p-5">
        <MediaUploader
          label="Ảnh bìa sách"
          kind="image"
          value={form.coverImage || ""}
          onChange={(url) => update("coverImage", url)}
        />
      </div>

      <div className="rounded-2xl border border-mist bg-white/60 p-5">
        <PdfUploader
          label="Nội dung sách (tệp PDF, bắt buộc)"
          value={form.contentUrl || ""}
          onChange={(url) => update("contentUrl", url)}
          error={fieldErrors.contentUrl}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Xuất bản sách (hiển thị cho người dùng)
      </label>

      {error && <p className="text-sm text-bordeaux">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-bordeaux px-6 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : bookId ? "Lưu thay đổi" : "Thêm sách"}
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
