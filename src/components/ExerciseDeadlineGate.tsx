"use client";

import { useCallback, useRef, useState } from "react";
import type { Submission } from "@/types";
import { isDeadlinePassed, type DeadlineInfo } from "@/lib/deadline";
import MaterialFileAction from "./MaterialFileAction";
import MaterialSubmission from "./MaterialSubmission";
import DeadlineCountdown from "./DeadlineCountdown";
import DownloadNoticeModal from "./DownloadNoticeModal";
import { useToast } from "@/components/Toast";

type ExerciseFile = { url: string; name?: string; type?: string };

export default function ExerciseDeadlineGate({
  materialId,
  files,
  initialSubmission,
  deadline,
  onDeadlineStarted,
}: {
  materialId: string;
  files: ExerciseFile[];
  initialSubmission: Submission | null;
  // Đếm giờ hiện tại của ĐÚNG tài liệu này, do component cha (MaterialsPager)
  // nắm giữ và truyền xuống — cha không bị unmount khi chuyển qua lại giữa
  // các bài, nên đồng hồ đếm ngược của từng tài liệu không bị mất.
  deadline: DeadlineInfo | null;
  onDeadlineStarted: (materialId: string, info: DeadlineInfo) => void;
}) {
  const { showToast } = useToast();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const resolveRef = useRef<((proceed: boolean) => void) | null>(null);

  // Được gọi trước khi tệp bài tập thực sự được tải/xem. Nếu đây là lần
  // đầu, hiện thông báo 48 tiếng và chờ học viên xác nhận; nếu đã bắt đầu
  // đếm giờ từ trước thì cho tải/xem ngay.
  const ensureDeadlineStarted = useCallback((): Promise<boolean> => {
    if (deadline) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setNoticeOpen(true);
    });
  }, [deadline]);

  async function handleConfirmNotice() {
    setStarting(true);
    try {
      const res = await fetch(`/api/materials/${materialId}/deadline`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Có lỗi xảy ra, vui lòng thử lại.", "error");
        resolveRef.current?.(false);
        return;
      }
      onDeadlineStarted(materialId, { startedAt: data.startedAt, hours: data.hours });
      resolveRef.current?.(true);
    } catch {
      showToast("Có lỗi xảy ra, vui lòng thử lại.", "error");
      resolveRef.current?.(false);
    } finally {
      resolveRef.current = null;
      setStarting(false);
      setNoticeOpen(false);
    }
  }

  function handleCancelNotice() {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setNoticeOpen(false);
  }

  const locked = deadline ? isDeadlinePassed(deadline) : false;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Tài liệu bài tập
        </p>
        {deadline && <DeadlineCountdown deadline={deadline} />}
      </div>

      {files.map((f, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-3 py-2"
        >
          <span className="min-w-0 truncate text-sm text-ink">{f.name || `Tệp ${i + 1}`}</span>
          <MaterialFileAction
            url={f.url}
            name={f.name}
            type={f.type}
            onBeforeAction={ensureDeadlineStarted}
          />
        </div>
      ))}

      <MaterialSubmission
        materialId={materialId}
        initialSubmission={initialSubmission}
        locked={locked}
      />

      <DownloadNoticeModal
        open={noticeOpen}
        hours={48}
        confirming={starting}
        onCancel={handleCancelNotice}
        onConfirm={handleConfirmNotice}
      />
    </div>
  );
}
