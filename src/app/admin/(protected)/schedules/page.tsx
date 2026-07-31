"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StudentSchedule } from "@/types";
import Loader from "@/components/Loader";
import ScheduleFormModal from "@/components/ScheduleFormModal";
import {
  addWeeks,
  formatTime,
  formatWeekRangeLabel,
  getWeekDays,
  groupSchedulesByDay,
  isSameDay,
  startOfWeek,
  toISODateLocal,
  WEEKDAY_LABELS_SHORT,
} from "@/lib/schedule";

export default function AdminSchedulesPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [schedules, setSchedules] = useState<StudentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const isFirstLoad = useRef(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<StudentSchedule | null>(null);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const controller = new AbortController();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const params = new URLSearchParams({
      from: toISODateLocal(weekStart),
      to: toISODateLocal(weekEnd),
    });

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/schedules?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được thời khoá biểu.");
          return res.json();
        })
        .then((data: StudentSchedule[]) => {
          setSchedules(data);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được thời khoá biểu, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }
    run();
    return () => controller.abort();
  }, [weekStart, reloadKey]);

  const groupedByDay = useMemo(
    () => groupSchedulesByDay(schedules, weekDays),
    [schedules, weekDays]
  );

  function openCreateModal(defaultDate?: string) {
    setEditingSchedule(null);
    setModalDefaultDate(defaultDate);
    setModalOpen(true);
  }

  function openEditModal(schedule: StudentSchedule) {
    setEditingSchedule(schedule);
    setModalDefaultDate(undefined);
    setModalOpen(true);
  }

  function handleSaved(saved: StudentSchedule) {
    setSchedules((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? saved : s));
      return [...prev, saved];
    });
    // Ca học vừa lưu có thể rơi vào tuần khác tuần đang xem (đổi ngày) ->
    // tải lại để đảm bảo danh sách tuần hiện tại luôn khớp với DB.
    setReloadKey((k) => k + 1);
    setModalOpen(false);
  }

  function handleDeleted(id: string) {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    setModalOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Thời khoá biểu</h1>
          <div className="ribbon-rule mt-3" />
        </div>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="rounded-full bg-bordeaux px-5 py-2.5 text-sm font-semibold text-parchment transition hover:bg-bordeaux/90"
        >
          + Thêm lịch học
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setWeekStart((d) => addWeeks(d, -1))}
          aria-label="Tuần trước"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-ink hover:bg-mist"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 4.5 6 10l6.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setWeekStart(startOfWeek(new Date()))}
          className="rounded-full border border-mist px-4 py-2 text-sm font-medium text-ink hover:bg-mist"
        >
          Tuần này
        </button>
        <button
          type="button"
          onClick={() => setWeekStart((d) => addWeeks(d, 1))}
          aria-label="Tuần sau"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-mist text-ink hover:bg-mist"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 4.5 14 10l-6.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="ml-1 text-sm font-medium text-ink/70">{formatWeekRangeLabel(weekStart)}</span>
      </div>

      {loading && <Loader label="Đang tải thời khoá biểu..." />}

      {!loading && error && (
        <div className="rounded-lg border border-mist bg-white/60 px-4 py-8 text-center">
          <p className="text-bordeaux">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="scroll-x-fancy overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[15.5rem] gap-3 lg:auto-cols-fr lg:grid-cols-7">
            {weekDays.map((day, dayIndex) => {
              const key = toISODateLocal(day);
              const entries = groupedByDay.get(key) || [];
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={key}
                  className={`flex min-w-0 flex-col rounded-2xl border bg-white/60 ${
                    isToday ? "border-bordeaux/50 ring-1 ring-bordeaux/20" : "border-mist"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-2 rounded-t-2xl border-b px-3 py-2.5 ${
                      isToday ? "border-bordeaux/30 bg-bordeaux/5" : "border-mist"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-semibold ${isToday ? "text-bordeaux" : "text-ink"}`}>
                        {WEEKDAY_LABELS_SHORT[dayIndex]}
                      </p>
                      <p className="text-xs text-ink/50">
                        {String(day.getDate()).padStart(2, "0")}/{String(day.getMonth() + 1).padStart(2, "0")}/{day.getFullYear()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openCreateModal(key)}
                      aria-label="Thêm ca học cho ngày này"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-bordeaux hover:bg-bordeaux/10"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none">
                        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  <div className="scroll-y-fancy flex max-h-[32rem] flex-col gap-2 overflow-y-auto p-2.5">
                    {entries.length === 0 ? (
                      <p className="px-1 py-4 text-center text-xs text-ink/40">Chưa có ca học</p>
                    ) : (
                      entries.map(({ schedule, caNumber }) => {
                        const start = new Date(schedule.startTime);
                        const end = new Date(start.getTime() + schedule.duration * 60 * 60 * 1000);
                        return (
                          <div
                            key={schedule.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openEditModal(schedule)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openEditModal(schedule);
                              }
                            }}
                            className="cursor-pointer rounded-xl border border-mist bg-white p-2.5 text-xs shadow-sm transition hover:border-bordeaux/40 hover:bg-mist/20"
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-gold/20 px-2 py-0.5 font-semibold text-ink">
                                Ca {caNumber}
                                {schedule.recurringId && (
                                  <svg
                                    className="h-3 w-3 text-bordeaux"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    aria-label="Lịch lặp hàng tuần"
                                  >
                                    <path
                                      d="M4 10a6 6 0 0 1 10.2-4.3M16 10a6 6 0 0 1-10.2 4.3M13.3 4.3H16V1.6M6.7 15.7H4v2.7"
                                      stroke="currentColor"
                                      strokeWidth="1.6"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </span>
                              <span className="shrink-0 whitespace-nowrap font-semibold text-bordeaux">
                                {formatTime(start)}–{formatTime(end)}
                              </span>
                            </div>
                            <div className="mt-1.5 flex min-w-0 items-center gap-1.5" title={schedule.courseTitle}>
                              <svg
                                className="h-3 w-3 shrink-0 text-ink/40"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M3 5.5C3 4.67 3.67 4 4.5 4H9a2 2 0 0 1 2 2v10a1.5 1.5 0 0 0-1.5-1.5H3V5.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M17 5.5c0-.83-.67-1.5-1.5-1.5H11a2 2 0 0 0-2 2v10a1.5 1.5 0 0 1 1.5-1.5H17V5.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <p className="min-w-0 truncate font-semibold text-ink">{schedule.courseTitle || "—"}</p>
                            </div>
                            <div className="mt-0.5 flex min-w-0 items-center gap-1.5" title={schedule.studentName}>
                              <svg
                                className="h-3 w-3 shrink-0 text-ink/40"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                              >
                                <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4" />
                                <path
                                  d="M4 17c0-3.31 2.69-5.5 6-5.5s6 2.19 6 5.5"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <p className="min-w-0 truncate text-ink/70">{schedule.studentName}</p>
                            </div>
                            <div className="flex min-w-0 items-center gap-1.5" title={schedule.studentEmail}>
                              <svg
                                className="h-3 w-3 shrink-0 text-ink/40"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                              >
                                <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                                <path
                                  d="m3 5.5 7 5.5 7-5.5"
                                  stroke="currentColor"
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <p className="min-w-0 truncate text-ink/50">{schedule.studentEmail}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ScheduleFormModal
        open={modalOpen}
        schedule={editingSchedule}
        defaultDate={modalDefaultDate}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
