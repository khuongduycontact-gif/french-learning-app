"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, CourseInput } from "@/types";
import MediaUploader from "./MediaUploader";

const levels = ["A1", "A2", "B1", "B2", "C1"];

export default function CourseForm({
  initial,
  courseId,
}: {
  initial?: Partial<Course>;
  courseId?: string; // nếu có -> chế độ chỉnh sửa
}) {
  const router = useRouter();
  const [form, setForm] = useState<CourseInput>({
    title: initial?.title || "",
    description: initial?.description || "",
    level: (initial?.level as any) || "A1",
    price: initial?.price ?? 0,
    duration: initial?.duration ?? 0,
    imageUrl: initial?.imageUrl || "",
    videoUrl: initial?.videoUrl || "",
    published: initial?.published ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      router.push("/admin/courses");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Tiêu đề</label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Ví dụ: Tiếng Pháp Vỡ Lòng A1"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Mô tả</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          placeholder="Mô tả nội dung, đối tượng học viên..."
        />
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
            onChange={(e) => update("duration", Number(e.target.value))}
            className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Học phí (VNĐ)</label>
        <input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => update("price", Number(e.target.value))}
          className="w-full max-w-[240px] rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
        />
      </div>

      <MediaUploader
        label="Ảnh bìa khoá học"
        kind="image"
        value={form.imageUrl || ""}
        onChange={(url) => update("imageUrl", url)}
      />

      <MediaUploader
        label="Video giới thiệu (tuỳ chọn)"
        kind="video"
        value={form.videoUrl || ""}
        onChange={(url) => update("videoUrl", url)}
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
