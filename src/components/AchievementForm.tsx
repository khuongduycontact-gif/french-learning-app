"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Achievement, AchievementInput } from "@/types";
import MediaUploader from "./MediaUploader";
import { useToast } from "./Toast";

const levels = ["A1", "A2", "B1", "B2", "C1"];

export default function AchievementForm({
  initial,
  achievementId,
}: {
  initial?: Partial<Achievement>;
  achievementId?: string; // nếu có -> chế độ chỉnh sửa
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState<AchievementInput>({
    level: (initial?.level as any) || "A1",
    studentName: initial?.studentName || "",
    evidenceUrl: initial?.evidenceUrl || "",
    thankYouUrl: initial?.thankYouUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof AchievementInput, string>>
  >({});

  function update<K extends keyof AchievementInput>(key: K, value: AchievementInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key] ? { ...f, [key]: undefined } : f));
  }

  function validateForm(): Partial<Record<keyof AchievementInput, string>> {
    const nextErrors: Partial<Record<keyof AchievementInput, string>> = {};
    if (!form.studentName.trim()) nextErrors.studentName = "Vui lòng nhập tên học viên.";
    if (!form.evidenceUrl) nextErrors.evidenceUrl = "Vui lòng chọn ảnh minh chứng.";
    if (!form.thankYouUrl) nextErrors.thankYouUrl = "Vui lòng chọn ảnh lời cảm ơn.";
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
        achievementId ? `/api/achievements/${achievementId}` : "/api/achievements",
        {
          method: achievementId ? "PUT" : "POST",
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
        achievementId ? "Cập nhật thành tích thành công!" : "Thêm thành tích thành công!",
        "success"
      );
      router.push("/admin/achievements");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cột trái: thông tin cơ bản */}
        <div className="flex flex-col gap-5 rounded-2xl border border-mist bg-white/60 p-6 lg:col-span-1">
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
            <label className="mb-1 block text-sm font-medium text-ink">Tên học viên</label>
            <input
              value={form.studentName}
              onChange={(e) => update("studentName", e.target.value)}
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
              placeholder="Ví dụ: Nguyễn Văn A"
            />
            {fieldErrors.studentName && (
              <p className="mt-1 text-xs text-bordeaux">{fieldErrors.studentName}</p>
            )}
          </div>
        </div>

        {/* Cột phải: 2 ảnh, chiếm nhiều không gian hơn để không bị trống */}
        <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2">
          <div className="rounded-2xl border border-mist bg-white/60 p-6">
            <MediaUploader
              label="Ảnh minh chứng"
              kind="image"
              value={form.evidenceUrl || ""}
              onChange={(url) => update("evidenceUrl", url)}
              error={fieldErrors.evidenceUrl}
            />
          </div>
          <div className="rounded-2xl border border-mist bg-white/60 p-6">
            <MediaUploader
              label="Ảnh lời cảm ơn của học viên"
              kind="image"
              value={form.thankYouUrl || ""}
              onChange={(url) => update("thankYouUrl", url)}
              error={fieldErrors.thankYouUrl}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-bordeaux">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-bordeaux px-6 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : achievementId ? "Lưu thay đổi" : "Thêm thành tích"}
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
