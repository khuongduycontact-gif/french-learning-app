"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course, CourseInput } from "@/types";
import MediaUploader from "./MediaUploader";
import CourseMaterialsEditor, { type MaterialDraft } from "./CourseMaterialsEditor";
import RichTextEditor from "./RichTextEditor";
import { useToast } from "./Toast";

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const levels = ["A1", "A2", "B1", "B2", "C1"];

type NumberFieldKey = "price" | "lessons";

// Chuyển số giờ dạng thập phân (VD: 1.5) sang chuỗi "HH:MM" để đổ vào
// input type="time" (trình duyệt tự hiện đồng hồ chọn, gõ số trực tiếp
// cũng được — không cần tự quy đổi giờ/phút thủ công nữa).
function decimalHoursToTimeValue(duration: number): string {
  const totalMinutes = Math.max(0, Math.round(duration * 60));
  const hours = Math.min(23, Math.floor(totalMinutes / 60));
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Chuyển ngược "HH:MM" từ input type="time" về số giờ dạng thập phân để lưu
function timeValueToDecimalHours(value: string): number {
  const [h, m] = value.split(":").map((v) => parseInt(v, 10));
  const hours = Number.isNaN(h) ? 0 : h;
  const minutes = Number.isNaN(m) ? 0 : m;
  return Number((hours + minutes / 60).toFixed(2));
}

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
    lessons: initial?.lessons ?? 0,
    videoUrl: initial?.videoUrl || "",
    published: initial?.published ?? true,
  });
  // Giá trị hiển thị dạng chữ cho các ô số - tách khỏi form.* để cho phép
  // xoá trắng ô (kể cả số 0 mặc định) trong lúc gõ, không bị tự nhảy về 0.
  const [numText, setNumText] = useState<Record<NumberFieldKey, string>>({
    price: String(initial?.price ?? 0),
    lessons: String(initial?.lessons ?? 0),
  });
  // Thời lượng giờ học/buổi học: bấm vào icon đồng hồ mới hiện 2 ô nhập
  // "giờ" và "phút" riêng biệt; lưu tạm dạng "HH:MM" rồi quy đổi sang thập phân.
  const [durationTime, setDurationTime] = useState(
    decimalHoursToTimeValue(initial?.duration ?? 0)
  );
  const [durationParts, setDurationParts] = useState(() => {
    const [h, m] = decimalHoursToTimeValue(initial?.duration ?? 0).split(":");
    return { hours: h, minutes: m };
  });
  const [durationPickerOpen, setDurationPickerOpen] = useState(false);
  const durationPickerRef = useRef<HTMLDivElement>(null);

  // Bấm ra ngoài popover giờ/phút thì tự đóng lại
  useEffect(() => {
    if (!durationPickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        durationPickerRef.current &&
        !durationPickerRef.current.contains(e.target as Node)
      ) {
        setDurationPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [durationPickerOpen]);
  const [materials, setMaterials] = useState<MaterialDraft[]>(
    (initial?.materials || []).map((m) => ({
      key: m.id,
      name: m.name,
      description: m.description || "",
      files: (m.files || []).map((f) => ({
        key: Math.random().toString(36).slice(2),
        url: f.url,
        type: f.type || "",
        name: f.name || "",
        category: f.category === "exercise" ? "exercise" : "lecture",
      })),
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CourseInput, string>>>({});
  const [materialsError, setMaterialsError] = useState("");

  function update<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((f) => (f[key] ? { ...f, [key]: undefined } : f));
  }

  function updateNumber(key: NumberFieldKey, raw: string) {
    // Cho phép xoá trắng ô (kể cả số 0 mặc định) để gõ số mới, không ép về 0 ngay
    if (raw === "") {
      setNumText((t) => ({ ...t, [key]: "" }));
      update(key, 0);
      return;
    }
    if (!/^\d+$/.test(raw)) return; // chỉ nhận chữ số

    // Nhập liên tiếp toàn số 0 (VD: "00") -> không cho nhập tiếp, báo lỗi ngay dưới ô
    if (/^0{2,}$/.test(raw)) {
      setFieldErrors((f) => ({ ...f, [key]: "Không được nhập số 0 ở đầu." }));
      return;
    }
    // Tự xoá số 0 ở đầu ngay khi có số khác 0 được nhập phía sau (VD: "02000" -> "2000")
    const cleaned = raw.replace(/^0+(?=[1-9])/, "");
    const n = parseInt(cleaned, 10);
    setNumText((t) => ({ ...t, [key]: cleaned }));
    update(key, (Number.isNaN(n) ? 0 : Math.max(0, n)) as CourseInput[typeof key]);
  }

  function handleNumberBlur(key: NumberFieldKey) {
    // Rời khỏi ô mà vẫn để trắng -> hiển thị lại 0 cho rõ ràng
    if (numText[key] === "") setNumText((t) => ({ ...t, [key]: "0" }));
  }

  // Gõ vào ô "giờ" hoặc "phút": chỉ cho phép tối đa 2 chữ số, cho phép xoá
  // trắng để gõ số mới (giống các ô số khác trong form). Lưu thẳng vào
  // form.duration ngay khi gõ (không đợi rời khỏi ô), tránh trường hợp bấm
  // Lưu ngay sau khi gõ mà giá trị chưa kịp "chốt".
  function updateDurationPart(part: "hours" | "minutes", raw: string) {
    if (raw !== "" && !/^\d{0,2}$/.test(raw)) return;
    setDurationParts((p) => {
      const next = { ...p, [part]: raw };
      const h = parseInt(next.hours, 10);
      const m = parseInt(next.minutes, 10);
      const hours = Math.min(23, Math.max(0, Number.isNaN(h) ? 0 : h));
      const minutes = Math.min(59, Math.max(0, Number.isNaN(m) ? 0 : m));
      const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      setDurationTime(value);
      update("duration", timeValueToDecimalHours(value));
      return next;
    });
  }

  // Rời khỏi ô giờ/phút: chỉ để hiển thị lại đúng dạng 2 chữ số có đệm số 0
  // (VD: "1" -> "01"), giá trị thực đã được lưu từ lúc gõ ở trên rồi.
  function commitDurationPart(part: "hours" | "minutes") {
    setDurationParts((p) => {
      const max = part === "hours" ? 23 : 59;
      let n = parseInt(p[part], 10);
      if (Number.isNaN(n)) n = 0;
      n = Math.min(max, Math.max(0, n));
      return { ...p, [part]: String(n).padStart(2, "0") };
    });
  }

  // Validate hoàn toàn tự viết (không dùng required/validate mặc định của trình duyệt),
  // áp dụng như nhau cho cả tạo mới lẫn chỉnh sửa khoá học.
  function validateForm(): Partial<Record<keyof CourseInput, string>> {
    const nextErrors: Partial<Record<keyof CourseInput, string>> = {};
    if (!form.title.trim()) nextErrors.title = "Vui lòng nhập tiêu đề.";
    if (!form.description.trim()) nextErrors.description = "Vui lòng nhập mô tả.";
    if (!form.duration || form.duration <= 0)
      nextErrors.duration = "Vui lòng nhập thời lượng lớn hơn 0.";
    if (!form.lessons || form.lessons <= 0)
      nextErrors.lessons = "Vui lòng nhập số bài giảng lớn hơn 0.";
    if (!form.videoUrl) nextErrors.videoUrl = "Vui lòng chọn ảnh hoặc video giới thiệu.";
    return nextErrors;
  }

  // Mỗi tài liệu phải có tên + ít nhất 1 tệp đã tải lên xong thì mới hợp lệ,
  // và bắt buộc phải có ít nhất 1 tài liệu hợp lệ.
  function validateMaterials(): string {
    let validCount = 0;
    for (let i = 0; i < materials.length; i++) {
      const m = materials[i];
      const uploadedFiles = m.files.filter((f) => f.url);
      const hasAnything = m.name.trim() || m.description?.trim() || m.files.length > 0;
      if (!hasAnything) continue;
      if (m.files.some((f) => !f.url)) {
        return `Tài liệu #${i + 1} còn tệp đang tải lên hoặc lỗi, vui lòng đợi hoặc xoá tệp đó.`;
      }
      if (!m.name.trim() || uploadedFiles.length === 0) {
        return `Vui lòng nhập tên và tải ít nhất 1 tệp cho tài liệu #${i + 1}, hoặc xoá tài liệu này.`;
      }
      validCount++;
    }
    if (validCount === 0) {
      return "Vui lòng thêm ít nhất 1 tài liệu học.";
    }
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validateForm();
    const materialsMsg = validateMaterials();
    if (Object.keys(nextErrors).length > 0 || materialsMsg) {
      setFieldErrors(nextErrors);
      setMaterialsError(materialsMsg);
      return;
    }

    setFieldErrors({});
    setMaterialsError("");
    setSaving(true);
    setError("");
    try {
      const payload: CourseInput = {
        ...form,
        materials: materials
          .filter((m) => m.name.trim() && m.files.some((f) => f.url))
          .map((m) => ({
            name: m.name.trim(),
            description: m.description?.trim() || "",
            files: m.files
              .filter((f) => f.url)
              .map((f) => ({
                url: f.url,
                type: f.type || "",
                name: f.name || "",
                category: f.category === "exercise" ? "exercise" : "lecture",
              })),
          })),
      };
      const res = await fetch(
        courseId ? `/api/courses/${courseId}` : "/api/courses",
        {
          method: courseId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-x-8 lg:gap-y-6"
    >
      {/* Cột chính (trái trên desktop): toàn bộ thông tin cơ bản + nút hành động, gộp làm 1 khối
          để chiều cao cột này chỉ phụ thuộc nội dung của chính nó, không bị cột phải kéo giãn theo. */}
      <div className="flex flex-col gap-5 lg:col-span-2">
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
          <RichTextEditor
            rows={4}
            value={form.description}
            onChange={(next) => update("description", next)}
            placeholder="Mô tả nội dung, đối tượng học viên..."
          />
          {fieldErrors.description && (
            <p className="mt-1 text-xs text-bordeaux">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
          <div className="relative" ref={durationPickerRef}>
            <label className="mb-1 block text-sm font-medium text-ink">
              Giờ học/buổi
            </label>
            <button
              type="button"
              onClick={() => setDurationPickerOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
              aria-label="Giờ học/buổi (giờ:phút)"
            >
              <span>{durationTime}</span>
              <ClockIcon className="h-4 w-4 shrink-0 text-ink/50" />
            </button>
            {durationPickerOpen && (
              <div className="absolute left-0 top-full z-20 mt-1.5 flex items-end gap-2 rounded-lg border border-mist bg-white p-3 shadow-lg">
                <div className="flex flex-col items-center gap-1">
                  <label className="text-[10px] text-ink/50">Giờ</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={durationParts.hours}
                    onChange={(e) => updateDurationPart("hours", e.target.value)}
                    onBlur={() => commitDurationPart("hours")}
                    onFocus={(e) => e.target.select()}
                    className="w-12 rounded-md border border-mist px-2 py-1.5 text-center text-sm"
                  />
                </div>
                <span className="pb-2 text-sm text-ink/50">:</span>
                <div className="flex flex-col items-center gap-1">
                  <label className="text-[10px] text-ink/50">Phút</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={durationParts.minutes}
                    onChange={(e) => updateDurationPart("minutes", e.target.value)}
                    onBlur={() => commitDurationPart("minutes")}
                    onFocus={(e) => e.target.select()}
                    className="w-12 rounded-md border border-mist px-2 py-1.5 text-center text-sm"
                  />
                </div>
              </div>
            )}
            {fieldErrors.duration && (
              <p className="mt-1 text-xs text-bordeaux">{fieldErrors.duration}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Số bài giảng</label>
            <input
              type="text"
              inputMode="numeric"
              value={numText.lessons}
              onChange={(e) => updateNumber("lessons", e.target.value)}
              onBlur={() => handleNumberBlur("lessons")}
              onFocus={(e) => e.target.select()}
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
            />
            {fieldErrors.lessons && (
              <p className="mt-1 text-xs text-bordeaux">{fieldErrors.lessons}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Học phí (vnđ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={numText.price}
              onChange={(e) => updateNumber("price", e.target.value)}
              onBlur={() => handleNumberBlur("price")}
              onFocus={(e) => e.target.select()}
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="block text-sm font-medium text-ink">Hình ảnh &amp; video</label>
          <div className="rounded-2xl border border-mist bg-white/60 p-5">
            <MediaUploader
              label="Giới thiệu (ảnh hoặc video, bắt buộc)"
              kind="image-or-video"
              value={form.videoUrl || ""}
              onChange={(url) => update("videoUrl", url)}
              error={fieldErrors.videoUrl}
            />
          </div>
        </div>

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
      </div>

      {/* Cột phụ (phải trên desktop, dính khi cuộn): tài liệu học.
          lg:min-h-0 cho phép cột này bị nén xuống đúng bằng chiều cao (đã stretch)
          của cột trái thay vì kéo giãn cả grid theo nội dung của chính nó;
          overflow-y-auto khiến phần vượt quá tự cuộn riêng bên trong. */}
      <div className="no-scrollbar flex min-h-0 flex-col gap-3 lg:col-span-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
        <CourseMaterialsEditor value={materials} onChange={setMaterials} />
        {materialsError && <p className="text-xs text-bordeaux">{materialsError}</p>}
      </div>
    </form>
  );
}
