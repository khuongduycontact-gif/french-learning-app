"use client";

import { useState } from "react";
import type { Submission, SubmissionFile } from "@/types";
import SubmissionFilesUploader from "./SubmissionFilesUploader";
import MaterialFileAction from "./MaterialFileAction";
import { useToast } from "@/components/Toast";
import { formatDateTime } from "@/lib/format";

const statusLabel: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Đã nộp - chờ chữa", className: "bg-gold/15 text-ink" },
  GRADED: { label: "Đã chữa bài", className: "bg-green-100 text-green-700" },
};

export default function SubmissionCard({
  submission: initial,
  highlighted,
}: {
  submission: Submission;
  highlighted?: boolean;
}) {
  const { showToast } = useToast();
  const [submission, setSubmission] = useState(initial);
  const [formOpen, setFormOpen] = useState(false);
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleResubmit() {
    if (files.length === 0) {
      setError("Vui lòng đính kèm ít nhất 1 tệp bài làm.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: submission.materialId, files, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Nộp bài thất bại, vui lòng thử lại.");
        return;
      }
      setSubmission(data);
      setFormOpen(false);
      setFiles([]);
      setNote("");
      showToast("Đã nộp lại bài thành công!", "success");
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      id={submission.id}
      className={`flex flex-col gap-3 rounded-2xl border p-4 ${
        highlighted ? "border-gold bg-gold/5" : "border-mist bg-white/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-ink">{submission.material?.name}</p>
          <p className="text-xs text-ink/50">
            Nộp lúc {formatDateTime(submission.submittedAt)}
          </p>
        </div>
        <span
          className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[submission.status].className}`}
        >
          {statusLabel[submission.status].label}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {submission.files.map((f, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-3 py-2"
          >
            <span className="min-w-0 truncate text-sm text-ink">{f.name || `Tệp ${i + 1}`}</span>
            <MaterialFileAction url={f.url} name={f.name} type={f.type} />
          </div>
        ))}
        {submission.note && (
          <p className="rounded-lg bg-mist/30 px-3 py-2 text-sm text-ink/70">
            <span className="font-medium text-ink">Ghi chú của bạn: </span>
            {submission.note}
          </p>
        )}
      </div>

      {submission.status === "GRADED" && submission.gradedFiles && (
        <div className="flex flex-col gap-1.5 border-t border-mist pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Bài đã được chữa
          </p>
          {submission.gradedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50/60 px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-ink">{f.name || `Tệp ${i + 1}`}</span>
              <MaterialFileAction url={f.url} name={f.name} type={f.type} />
            </div>
          ))}
          {submission.gradedNote && (
            <p className="rounded-lg bg-white px-3 py-2 text-sm text-ink/70">
              <span className="font-medium text-ink">Nhận xét: </span>
              {submission.gradedNote}
            </p>
          )}
          {submission.gradedAt && (
            <p className="text-xs text-ink/40">Chữa xong lúc {formatDateTime(submission.gradedAt)}</p>
          )}
        </div>
      )}

      {!formOpen ? (
        <button
          type="button"
          onClick={() => {
            setFormOpen(true);
            setFiles([]);
            setNote("");
          }}
          className="self-start text-sm font-medium text-bordeaux hover:underline"
        >
          Nộp lại bài khác
        </button>
      ) : (
        <div className="flex flex-col gap-3 border-t border-mist pt-3">
          <SubmissionFilesUploader label="" values={files} onChange={setFiles} />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú cho giáo viên (không bắt buộc)"
            rows={2}
            className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
          />
          {error && <p className="text-xs text-bordeaux">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleResubmit}
              disabled={submitting}
              className="rounded-full bg-bordeaux px-4 py-1.5 text-sm font-medium text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
            >
              {submitting ? "Đang nộp..." : "Nộp bài"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setError("");
              }}
              disabled={submitting}
              className="rounded-full border border-mist bg-white px-4 py-1.5 text-sm font-medium text-ink hover:bg-mist"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
