"use client";

import { useState } from "react";
import type { Submission, SubmissionFile } from "@/types";
import SubmissionFilesUploader from "./SubmissionFilesUploader";
import MaterialFileAction from "./MaterialFileAction";
import { useToast } from "@/components/Toast";

const statusLabel: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Đã nộp - chờ chữa", className: "bg-gold/15 text-ink" },
  GRADED: { label: "Đã chữa bài", className: "bg-green-100 text-green-700" },
};

export default function MaterialSubmission({
  materialId,
  initialSubmission,
}: {
  materialId: string;
  initialSubmission: Submission | null;
}) {
  const { showToast } = useToast();
  const [submission, setSubmission] = useState<Submission | null>(initialSubmission);
  const [formOpen, setFormOpen] = useState(false);
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
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
        body: JSON.stringify({ materialId, files, note: note.trim() || undefined }),
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
      showToast("Đã nộp bài thành công!", "success");
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-dashed border-bordeaux/30 bg-bordeaux/[0.03] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Nộp bài tập
        </p>
        {submission && (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[submission.status].className}`}
          >
            {statusLabel[submission.status].label}
          </span>
        )}
      </div>

      {submission && !formOpen && (
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-ink/50">Bài bạn đã nộp:</p>
            {submission.files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-3 py-2"
              >
                <span className="min-w-0 truncate text-sm text-ink">{f.name || `Tệp ${i + 1}`}</span>
                <MaterialFileAction url={f.url} name={f.name} type={f.type} />
              </div>
            ))}
          </div>

          {submission.status === "GRADED" && submission.gradedFiles && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-ink/50">Bài đã được chữa:</p>
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
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setFormOpen(true);
              setFiles([]);
              setNote("");
            }}
            className="mt-1 self-start text-sm font-medium text-bordeaux hover:underline"
          >
            Nộp lại bài khác
          </button>
        </div>
      )}

      {!submission && !formOpen && (
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="self-start rounded-full bg-bordeaux px-4 py-1.5 text-sm font-medium text-parchment transition hover:bg-bordeaux/90"
        >
          Nộp bài làm
        </button>
      )}

      {formOpen && (
        <div className="flex flex-col gap-3">
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
              onClick={handleSubmit}
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
