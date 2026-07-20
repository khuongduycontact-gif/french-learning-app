"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, CourseInput } from "@/types";
import MediaUploader from "./MediaUploader";
import { useToast } from "./Toast";

const levels = ["A1", "A2", "B1", "B2", "C1"];

export default function CourseForm({
  initial,
  courseId,
}: {
  initial?: Partial<Course>;
  courseId?: string; // nếu có -> chế độ chỉnh sửa
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<CourseInput>({
    title: initial?.title || "",
    description: initial?.description || "",
    level: (initial?.level as any) || "A1",
    price: initial?.price ?? 0,
    duration: initial?.duration ?? 0,
    sessions: initial?.sessions ?? 0,
    lessons: initial?.lessons ?? 0,
    imageUrl: initial?.imageUrl || "",
    videoUrl: initial?.videoUrl || "",
    published: initial?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CourseInput, string>>>({});

  function update<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key] ? { ...f, [key]: undefined } : f));
  }

  function updateNumber(
    key: "price" | "duration" | "sessions" | "lessons",
    raw: string
  ) {
    // Nhập liên tiếp toàn số 0 (VD: "00") -> không cho nhập tiếp, báo lỗi ngay dưới ô
    if (/^0{2,}$/.test(raw)) {
      setFieldErrors((f) => ({ ...f, [key]: "Không được nhập số 0 ở đầu." }));
      return;
    }
    // Tự xoá số 0 ở đầu ngay khi có số khác 0 được nhập phía sau (VD: "02000" -> "2000")
    const cleaned = raw.replace(/^0+(?=[1-9])/, "");
    const n = cleaned === "" ? 0 : parseInt(cleaned, 10);
    update(key, (Number.isNaN(n) ? 0 : Math.max(0, n)) as CourseInput[typeof key]);
  }

  // Validate hoàn toàn tự viết (không dùng required/validate mặc định của trình duyệt),
  // áp dụng như nhau cho cả tạo mới lẫn chỉnh sửa khoá học.
  function validateForm(): Partial<Record<keyof CourseInput, string>> {
    const nextErrors: Partial<Record<keyof CourseInput, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề.";
    if (!form.description.trim()) nextErrors.description = "Vui lòng nhập mô tả.";
    if (!form.duration || form.duration <= 0)
      nextErrors.duration = "Vui lòng nhập thời lượng lớn hơn 0.";
    if (!form.sessions || form.sessions <= 0)
      nextErrors.sessions = "Vui lòng nhập số buổi học lớn hơn 0.";
    if (!form.lessons || form.lessons <= 0)
      nextErrors.lessons = "Vui lòng nhập số bài giảng lớn hơn 0.";
    if (!form.imageUrl) nextErrors.imageUrl = "Vui lòng chọn ảnh bìa khoá học.";
    if (!form.videoUrl) nextErrors.videoUrl = "Vui lòng chọn ảnh hoặc video giới thiệu.";
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
        courseId ? `/api/courses/${courseId}` : "/api/courses",
        {
          method: courseId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }
      showToast(
        courseId ? "Cập nhật khoá học thành công!" : "Tạo khoá học thành công!",
        "success"
      );
      router.push("/admin/courses");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Tiêu đề</label>
        <input
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Ví dụ: Tiếng Pháp Vỡ Lòng A1"
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-bordeaux">{fieldErrors.title}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Mô tả</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Mô tả nội dung, đối tượng học viên..."
        />
        {fieldErrors.description && (
          <p className="mt-1 text-xs text-bordeaux">{fieldErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Trình độ</label>
          <select
            value={form.level}
            onChange={(e) => update("level", e.target.value as any)}
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          >
            {levels.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Thời lượng (giờ)</label>
          <input
            type="number"
            min={0}
            value={form.duration}
            onChange={(e) => updateNumber("duration", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          />
          {fieldErrors.duration && (
            <p className="mt-1 text-xs text-bordeaux">{fieldErrors.duration}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Số buổi học</label>
          <input
            type="number"
            min={0}
            value={form.sessions}
            onChange={(e) => updateNumber("sessions", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          />
          {fieldErrors.sessions && (
            <p className="mt-1 text-xs text-bordeaux">{fieldErrors.sessions}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Số bài giảng</label>
          <input
            type="number"
            min={0}
            value={form.lessons}
            onChange={(e) => updateNumber("lessons", e.target.value)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          />
          {fieldErrors.lessons && (
            <p className="mt-1 text-xs text-bordeaux">{fieldErrors.lessons}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Học phí (VNĐ)</label>
        <input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => updateNumber("price", e.target.value)}
          onFocus={(e) => e.target.select()}
          className="w-full max-w-[240px] rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
        />
      </div>

      <MediaUploader
        label="Ảnh bìa khoá học (bắt buộc)"
        kind="image"
        value={form.imageUrl || ""}
        onChange={(url) => update("imageUrl", url)}
        error={fieldErrors.imageUrl}
      />

      <MediaUploader
        label="Giới thiệu (ảnh hoặc video, bắt buộc)"
        kind="image-or-video"
        value={form.videoUrl || ""}
        onChange={(url) => update("videoUrl", url)}
        error={fieldErrors.videoUrl}
      />

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => update("published", e.target.checked)}
        />
        Xuất bản khoá học (hiển thị cho học viên)
      </label>

      {error && <p className="text-sm text-bordeaux">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-bordeaux px-6 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : courseId ? "Lưu thay đổi" : "Tạo khoá học"}
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
