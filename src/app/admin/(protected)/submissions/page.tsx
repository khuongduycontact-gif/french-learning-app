"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Submission, SubmissionFile } from "@/types";
import { useToast } from "@/components/Toast";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import MaterialFileAction from "@/components/MaterialFileAction";
import SubmissionFilesUploader from "@/components/SubmissionFilesUploader";
import AdminDeadlinesPanel from "@/components/AdminDeadlinesPanel";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 10;

const statusFilters: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "SUBMITTED", label: "Chờ chữa" },
  { value: "GRADED", label: "Đã chữa" },
];

const statusLabel: Record<string, { label: string; className: string }> = {
  SUBMITTED: { label: "Chờ chữa", className: "bg-gold/15 text-ink" },
  GRADED: { label: "Đã chữa", className: "bg-green-100 text-green-700" },
};

export default function AdminSubmissionsPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [view, setView] = useState<"submissions" | "deadlines">("submissions");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isFirstLoad = useRef(true);
  const highlightRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (highlightId) {
      setExpandedId(highlightId);
      highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, submissions]);

  useEffect(() => {
    const controller = new AbortController();

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/submissions?scope=admin`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách bài nộp.");
          return res.json();
        })
        .then((data: Submission[]) => {
          setSubmissions(data);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách bài nộp, vui lòng thử lại.");
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
  }, [reloadKey]);

  // Danh sách khoá học / bài tập duy nhất, lấy từ chính dữ liệu bài nộp, để
  // admin lọc đúng khoá học -> đúng bài tập cần chữa.
  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions.forEach((s) => {
      if (s.course) map.set(s.course.id, s.course.title);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [submissions]);

  const materialOptions = useMemo(() => {
    const map = new Map<string, string>();
    submissions
      .filter((s) => !courseFilter || s.courseId === courseFilter)
      .forEach((s) => {
        if (s.material) map.set(s.material.id, s.material.name);
      });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [submissions, courseFilter]);

  useEffect(() => {
    // Đổi khoá học -> bỏ chọn bài tập cũ nếu không còn thuộc khoá học này
    setMaterialFilter("");
  }, [courseFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (courseFilter && s.courseId !== courseFilter) return false;
      if (materialFilter && s.materialId !== materialFilter) return false;
      if (!q) return true;
      const userName = s.user?.name?.toLowerCase() || "";
      const userEmail = s.user?.email?.toLowerCase() || "";
      const courseTitle = s.course?.title?.toLowerCase() || "";
      const materialName = s.material?.name?.toLowerCase() || "";
      return (
        userName.includes(q) ||
        userEmail.includes(q) ||
        courseTitle.includes(q) ||
        materialName.includes(q)
      );
    });
  }, [submissions, statusFilter, courseFilter, materialFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, courseFilter, materialFilter, search]);

  function handleGraded(updated: Submission) {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setExpandedId(null);
    showToast("Đã gửi bài chữa cho học viên!", "success");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Bài nộp &amp; chữa bài</h1>
        <div className="ribbon-rule mt-3" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "submissions" as const, label: "Bài nộp" },
          { value: "deadlines" as const, label: "Hạn nộp bài (48h)" },
        ].map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setView(t.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              view === t.value ? "bg-ink text-parchment" : "bg-white text-ink hover:bg-mist"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === "deadlines" ? (
        <AdminDeadlinesPanel />
      ) : (
        <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                statusFilter === f.value
                  ? "bg-bordeaux text-parchment"
                  : "bg-white text-ink hover:bg-mist"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink focus:border-bordeaux/40 focus:outline-none sm:w-64"
          >
            <option value="">Tất cả khoá học</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={materialFilter}
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="rounded-full border border-mist bg-white px-4 py-2 text-sm text-ink focus:border-bordeaux/40 focus:outline-none sm:w-64"
          >
            <option value="">Tất cả bài tập</option>
            {materialOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:ml-auto sm:w-[24rem]">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên học viên, khoá học, bài tập..."
              className="w-full rounded-full border border-mist bg-white py-2 pl-9 pr-8 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="scroll-x-fancy overflow-x-auto rounded-lg border border-mist bg-white/60">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-mist text-ink/60">
            <tr>
              <th className="px-4 py-3 font-medium">Học viên</th>
              <th className="px-4 py-3 font-medium">Khoá học</th>
              <th className="px-4 py-3 font-medium">Bài tập</th>
              <th className="px-4 py-3 font-medium">Nộp lúc</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-2">
                  <Loader label="Đang tải danh sách..." />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="text-bordeaux">{error}</p>
                  <button
                    type="button"
                    onClick={() => setReloadKey((k) => k + 1)}
                    className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
                  >
                    Thử lại
                  </button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  {search || statusFilter || courseFilter || materialFilter
                    ? "Không tìm thấy kết quả phù hợp."
                    : "Chưa có bài nộp nào."}
                </td>
              </tr>
            ) : (
              pageItems.map((s) => (
                <>
                  <tr
                    key={s.id}
                    ref={s.id === highlightId ? highlightRef : undefined}
                    className={`border-b border-mist align-top last:border-0 ${
                      s.id === highlightId ? "bg-gold/10" : ""
                    } ${expandedId === s.id ? "border-b-0" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {s.user?.image ? (
                          <Image
                            src={s.user.image}
                            alt={s.user.name || ""}
                            width={28}
                            height={28}
                            className="h-7 w-7 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-xs font-semibold leading-none text-ink">
                            {s.user?.name?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="cell-nowrap font-medium text-ink">{s.user?.name}</p>
                          <p className="cell-nowrap text-xs text-ink/50">{s.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {s.course?.id ? (
                        <Link
                          href={`/admin/courses/${s.course.id}/edit`}
                          className="cell-nowrap"
                        >
                          {s.course?.title}
                        </Link>
                      ) : (
                        <span className="cell-nowrap">{s.course?.title}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink">
                      <span className="cell-nowrap">{s.material?.name}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      <span className="cell-nowrap">{formatDateTime(s.submittedAt)}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusLabel[s.status].className}`}
                      >
                        {statusLabel[s.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        className="rounded-full bg-bordeaux px-4 py-1.5 text-xs font-medium text-parchment hover:bg-bordeaux/90"
                      >
                        {expandedId === s.id ? "Đóng" : s.status === "GRADED" ? "Xem / chữa lại" : "Xem & chữa bài"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === s.id && (
                    <tr className="border-b border-mist last:border-0">
                      <td colSpan={6} className="bg-mist/20 px-4 py-4">
                        <SubmissionGradePanel submission={s} onGraded={handleGraded} />
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function SubmissionGradePanel({
  submission,
  onGraded,
}: {
  submission: Submission;
  onGraded: (updated: Submission) => void;
}) {
  const [files, setFiles] = useState<SubmissionFile[]>(submission.gradedFiles || []);
  const [note, setNote] = useState(submission.gradedNote || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleGrade() {
    if (files.length === 0) {
      setError("Vui lòng đính kèm ít nhất 1 tệp bài đã chữa.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${submission.id}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gửi bài chữa thất bại, vui lòng thử lại.");
        return;
      }
      onGraded(data);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Bài học viên đã nộp
        </p>
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
          <p className="rounded-lg bg-white px-3 py-2 text-sm text-ink/70">
            <span className="font-medium text-ink">Ghi chú của học viên: </span>
            {submission.note}
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-mist pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Gửi bài đã chữa
        </p>
        <SubmissionFilesUploader label="" values={files} onChange={setFiles} />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhận xét cho học viên (không bắt buộc)"
          rows={3}
          className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
        />
        {error && <p className="text-xs text-bordeaux">{error}</p>}
        <button
          type="button"
          onClick={handleGrade}
          disabled={submitting}
          className="self-start rounded-full bg-bordeaux px-4 py-1.5 text-sm font-medium text-parchment transition hover:bg-bordeaux/90 disabled:opacity-60"
        >
          {submitting ? "Đang gửi..." : submission.status === "GRADED" ? "Gửi lại bài chữa" : "Gửi bài đã chữa"}
        </button>
      </div>
    </div>
  );
}
