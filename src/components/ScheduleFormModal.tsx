"use client";

// Modal thêm/sửa 1 ca học trong thời khoá biểu. Bấm nút "Sửa" ngay trên ô ca
// học ở thời khoá biểu, hoặc bấm "+ Thêm lịch học" ở mỗi ngày, đều mở modal
// này. Ngày giờ chọn ở đây luôn hiển thị kèm thứ trong tuần để admin không
// bị nhầm lịch.

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { StudentSchedule, StudentScheduleInput, RecurringScheduleInput } from "@/types";
import DatePicker from "./DatePicker";
import { useToast } from "./Toast";
import { formatWeekdayDate, toISODateLocal } from "@/lib/schedule";

function toDateAndTimeParts(iso: string): { date: string; hour: string; minute: string } {
  const d = new Date(iso);
  return {
    date: toISODateLocal(d),
    hour: String(d.getHours()).padStart(2, "0"),
    minute: String(d.getMinutes()).padStart(2, "0"),
  };
}

function decimalHoursToParts(duration: number): { hours: string; minutes: string } {
  const totalMinutes = Math.max(0, Math.round(duration * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours: String(hours).padStart(2, "0"), minutes: String(minutes).padStart(2, "0") };
}

export default function ScheduleFormModal({
  open,
  schedule,
  defaultDate,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  /** Có id -> chế độ sửa. Không có -> chế độ thêm mới. */
  schedule?: StudentSchedule | null;
  /** Ngày "yyyy-mm-dd" điền sẵn khi thêm mới từ 1 ô ngày cụ thể trên thời khoá biểu. */
  defaultDate?: string;
  onClose: () => void;
  onSaved: (schedule: StudentSchedule) => void;
  onDeleted?: (id: string) => void;
}) {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [durationParts, setDurationParts] = useState({ hours: "01", minutes: "30" });
  const [note, setNote] = useState("");

  // Lặp lại hàng tuần: chỉ áp dụng khi THÊM MỚI (không dùng khi sửa 1 buổi
  // đã có sẵn - sửa 1 buổi cụ thể trong lịch lặp không nên đổi cả chuỗi).
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [stoppingRecurring, setStoppingRecurring] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Đổ lại dữ liệu form mỗi khi mở modal (thêm mới hoặc sửa ca học khác nhau)
  useEffect(() => {
    if (!open) return;
    setError("");
    setFieldErrors({});
    if (schedule) {
      const { date: d, hour: h, minute: m } = toDateAndTimeParts(schedule.startTime);
      setStudentName(schedule.studentName);
      setStudentEmail(schedule.studentEmail);
      setCourseTitle(schedule.courseTitle);
      setDate(d);
      setHour(h);
      setMinute(m);
      setDurationParts(decimalHoursToParts(schedule.duration));
      setNote(schedule.note || "");
      setRepeatWeekly(false);
      setRepeatEndDate("");
    } else {
      setStudentName("");
      setStudentEmail("");
      setCourseTitle("");
      setDate(defaultDate || toISODateLocal(new Date()));
      setHour("09");
      setMinute("00");
      setDurationParts({ hours: "01", minutes: "30" });
      setNote("");
      setRepeatWeekly(false);
      setRepeatEndDate("");
    }
  }, [open, schedule, defaultDate]);

  const weekdayPreview = useMemo(() => {
    if (!date) return "";
    const [y, m, d] = date.split("-").map(Number);
    if (!y || !m || !d) return "";
    return formatWeekdayDate(new Date(y, m - 1, d));
  }, [date]);

  function updateNumberPart(setter: (v: string) => void, raw: string) {
    if (raw !== "" && !/^\d{0,2}$/.test(raw)) return;
    setter(raw);
  }

  function commitNumberPart(value: string, max: number, setter: (v: string) => void) {
    let n = parseInt(value, 10);
    if (Number.isNaN(n)) n = 0;
    n = Math.min(max, Math.max(0, n));
    setter(String(n).padStart(2, "0"));
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = "Vui lòng nhập tên học viên.";
    if (!studentEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim()))
      errs.studentEmail = "Vui lòng nhập đúng định dạng gmail.";
    if (!courseTitle.trim()) errs.courseTitle = "Vui lòng nhập tên khoá học.";
    if (!date) errs.date = "Vui lòng chọn ngày học.";
    const durH = parseInt(durationParts.hours, 10) || 0;
    const durM = parseInt(durationParts.minutes, 10) || 0;
    if (durH === 0 && durM === 0) errs.duration = "Vui lòng nhập thời lượng lớn hơn 0.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const [y, m, d] = date.split("-").map(Number);
    const startTime = new Date(y, m - 1, d, parseInt(hour, 10) || 0, parseInt(minute, 10) || 0);
    const duration = Number(
      ((parseInt(durationParts.hours, 10) || 0) + (parseInt(durationParts.minutes, 10) || 0) / 60).toFixed(2)
    );

    // Thêm mới + bật lặp lại hàng tuần -> gọi API tạo lịch lặp (sinh ra
    // nhiều buổi cùng lúc), khác với thêm 1 buổi đơn lẻ như bình thường.
    if (!schedule && repeatWeekly) {
      const recurringPayload: RecurringScheduleInput = {
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim(),
        courseTitle: courseTitle.trim(),
        startTime: startTime.toISOString(),
        duration,
        note: note.trim() || undefined,
        endDate: repeatEndDate ? new Date(`${repeatEndDate}T23:59:59`).toISOString() : undefined,
      };

      setSaving(true);
      setError("");
      try {
        const res = await fetch("/api/schedules/recurring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recurringPayload),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
          return;
        }
        showToast(
          `Đã tạo lịch lặp hàng tuần (${data.schedules.length} buổi học sắp tới)!`,
          "success"
        );
        // Chỉ cần đẩy buổi học đầu tiên lên danh sách đang xem ở tuần hiện
        // tại - các buổi kế tiếp ở tuần khác sẽ tự có khi component cha
        // tải lại (reloadKey) đúng theo tuần đang xem.
        onSaved(data.schedules[0]);
      } catch {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const payload: StudentScheduleInput = {
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      courseTitle: courseTitle.trim(),
      startTime: startTime.toISOString(),
      duration,
      note: note.trim() || undefined,
    };

    setSaving(true);
    setError("");
    try {
      const res = await fetch(schedule ? `/api/schedules/${schedule.id}` : "/api/schedules", {
        method: schedule ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại.");
        return;
      }
      showToast(schedule ? "Cập nhật lịch học thành công!" : "Thêm lịch học thành công!", "success");
      onSaved(data);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStopRecurring() {
    if (!schedule?.recurringId) return;
    if (
      !confirm(
        "Dừng lịch lặp này? Các buổi sắp tới (chưa diễn ra) trong chuỗi lặp sẽ bị xoá, buổi đã qua vẫn được giữ lại."
      )
    )
      return;
    setStoppingRecurring(true);
    try {
      const res = await fetch(`/api/schedules/recurring/${schedule.recurringId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Dừng lịch lặp thất bại, vui lòng thử lại.", "error");
        return;
      }
      showToast("Đã dừng lịch lặp hàng tuần.", "success");
      onDeleted?.(schedule.id);
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setStoppingRecurring(false);
    }
  }

  async function handleDelete() {
    if (!schedule) return;
    if (!confirm(`Xoá ca học của "${schedule.studentName}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Xoá lịch học thất bại, vui lòng thử lại.", "error");
        return;
      }
      showToast("Đã xoá ca học khỏi thời khoá biểu.", "success");
      onDeleted?.(schedule.id);
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 py-8 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-bordeaux">
              Thời khoá biểu
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">
              {schedule ? "Sửa lịch học" : "Thêm lịch học"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-full p-1.5 text-ink/40 hover:bg-mist hover:text-ink"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Tên học viên</label>
              <input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
              />
              {fieldErrors.studentName && (
                <p className="mt-1 text-xs text-bordeaux">{fieldErrors.studentName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Gmail học viên</label>
              <input
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="hocvien@gmail.com"
                className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
              />
              {fieldErrors.studentEmail && (
                <p className="mt-1 text-xs text-bordeaux">{fieldErrors.studentEmail}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Khoá học</label>
            <input
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Ví dụ: Pháp Ngữ Trung Cấp B1"
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
            />
            {fieldErrors.courseTitle && (
              <p className="mt-1 text-xs text-bordeaux">{fieldErrors.courseTitle}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Ngày, giờ học</label>
            <div className="flex flex-wrap items-start gap-2">
              <DatePicker value={date} onChange={setDate} ariaLabel="Chọn ngày học" className="w-[9.5rem]" />
              <div className="flex items-center gap-1.5 rounded-lg border border-mist bg-white px-2 py-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={hour}
                  onChange={(e) => updateNumberPart(setHour, e.target.value)}
                  onBlur={() => commitNumberPart(hour, 23, setHour)}
                  onFocus={(e) => e.target.select()}
                  aria-label="Giờ"
                  className="w-9 rounded-md px-1 py-1.5 text-center text-sm"
                />
                <span className="text-sm text-ink/50">:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={minute}
                  onChange={(e) => updateNumberPart(setMinute, e.target.value)}
                  onBlur={() => commitNumberPart(minute, 59, setMinute)}
                  onFocus={(e) => e.target.select()}
                  aria-label="Phút"
                  className="w-9 rounded-md px-1 py-1.5 text-center text-sm"
                />
              </div>
            </div>
            {weekdayPreview && (
              <p className="mt-1.5 text-xs font-medium text-bordeaux">{weekdayPreview}</p>
            )}
            {fieldErrors.date && <p className="mt-1 text-xs text-bordeaux">{fieldErrors.date}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Thời lượng buổi học</label>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 rounded-lg border border-mist bg-white px-2 py-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={durationParts.hours}
                  onChange={(e) =>
                    updateNumberPart((v) => setDurationParts((p) => ({ ...p, hours: v })), e.target.value)
                  }
                  onBlur={() =>
                    commitNumberPart(durationParts.hours, 23, (v) => setDurationParts((p) => ({ ...p, hours: v })))
                  }
                  onFocus={(e) => e.target.select()}
                  aria-label="Số giờ"
                  className="w-9 rounded-md px-1 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-ink/50">giờ</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-mist bg-white px-2 py-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={durationParts.minutes}
                  onChange={(e) =>
                    updateNumberPart((v) => setDurationParts((p) => ({ ...p, minutes: v })), e.target.value)
                  }
                  onBlur={() =>
                    commitNumberPart(durationParts.minutes, 59, (v) => setDurationParts((p) => ({ ...p, minutes: v })))
                  }
                  onFocus={(e) => e.target.select()}
                  aria-label="Số phút"
                  className="w-9 rounded-md px-1 py-1.5 text-center text-sm"
                />
                <span className="text-xs text-ink/50">phút</span>
              </div>
            </div>
            {fieldErrors.duration && (
              <p className="mt-1 text-xs text-bordeaux">{fieldErrors.duration}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Ghi chú (không bắt buộc)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ví dụ: học bù, đổi phòng..."
              className="w-full rounded-lg border border-mist bg-white px-4 py-2.5 text-sm"
            />
          </div>

          {!schedule && (
            <div className="rounded-xl border border-mist bg-mist/20 p-3.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="h-4 w-4 rounded border-mist text-bordeaux focus:ring-bordeaux/30"
                />
                Lặp lại hàng tuần (cùng thứ, cùng giờ)
              </label>
              {repeatWeekly && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-medium text-ink/70">
                    Ngày kết thúc lặp (không bắt buộc)
                  </label>
                  <DatePicker
                    value={repeatEndDate}
                    onChange={setRepeatEndDate}
                    ariaLabel="Ngày kết thúc lặp lịch"
                    className="w-[9.5rem]"
                  />
                  <p className="mt-1.5 text-xs text-ink/50">
                    Để trống = lặp lại hàng tuần không giới hạn, hệ thống tự sinh thêm buổi học mới
                    theo thời gian, đến khi bạn chủ động dừng lịch lặp này.
                  </p>
                </div>
              )}
            </div>
          )}

          {schedule?.recurringId && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 p-3.5 text-xs text-ink/80">
              <span>
                Buổi học này thuộc <span className="font-semibold">1 lịch lặp hàng tuần</span>. Sửa/xoá ở
                đây chỉ áp dụng cho riêng buổi này.
              </span>
              <button
                type="button"
                onClick={handleStopRecurring}
                disabled={stoppingRecurring}
                className="shrink-0 rounded-full border border-bordeaux/40 px-3 py-1.5 font-medium text-bordeaux hover:bg-bordeaux/5 disabled:opacity-50"
              >
                {stoppingRecurring ? "Đang dừng..." : "Dừng lịch lặp"}
              </button>
            </div>
          )}

          {error && <p className="text-sm text-bordeaux">{error}</p>}

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            {schedule ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-sm font-medium text-bordeaux hover:underline disabled:opacity-50"
              >
                {deleting ? "Đang xoá..." : "Xoá ca học"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving || deleting}
                className="rounded-full border border-mist px-5 py-2.5 text-sm font-medium text-ink hover:bg-mist"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="rounded-full bg-bordeaux px-6 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : schedule ? "Lưu thay đổi" : "Thêm lịch học"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
