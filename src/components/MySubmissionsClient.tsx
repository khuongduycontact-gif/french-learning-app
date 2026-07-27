"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Submission } from "@/types";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import DatePicker from "@/components/DatePicker";
import Select from "@/components/Select";
import SubmissionCard from "@/components/SubmissionCard";

const PAGE_SIZE = 10;

type FilterMaterial = { id: string; name: string };
type FilterCourse = { id: string; title: string; materials: FilterMaterial[] };

const statusFilters: { value: string; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "SUBMITTED", label: "Chờ chữa" },
  { value: "GRADED", label: "Đã chữa" },
];

export default function MySubmissionsClient() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterCourses, setFilterCourses] = useState<FilterCourse[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();

    function run() {
      setLoading(true);
      setError("");
      Promise.all([
        fetch(`/api/submissions`, { signal: controller.signal }),
        fetch(`/api/submissions/filters`, { signal: controller.signal }),
      ])
        .then(async ([subRes, filterRes]) => {
          if (!subRes.ok) throw new Error("Không tải được danh sách bài tập.");
          const subData: Submission[] = await subRes.json();
          setSubmissions(subData);
          if (filterRes.ok) {
            const filterData: FilterCourse[] = await filterRes.json();
            setFilterCourses(filterData);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách bài tập, vui lòng thử lại.");
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

  // Danh sách khoá học chỉ gồm khoá học học viên đã đăng ký & được xác nhận,
  // bài tập chỉ gồm những bài tập của khoá học đang chọn.
  const courseOptions = useMemo(() => {
    return [
      { value: "", label: "Khoá học đã đăng ký" },
      ...filterCourses.map((c) => ({ value: c.id, label: c.title })),
    ];
  }, [filterCourses]);

  const materialOptions = useMemo(() => {
    const course = filterCourses.find((c) => c.id === courseFilter);
    return [
      { value: "", label: "Tất cả bài tập" },
      ...(course ? course.materials.map((m) => ({ value: m.id, label: m.name })) : []),
    ];
  }, [filterCourses, courseFilter]);

  useEffect(() => {
    // Đổi khoá học -> bỏ chọn bài tập cũ nếu không còn thuộc khoá học này
    setMaterialFilter("");
  }, [courseFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTime = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
    const toTime = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;
    return submissions.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (courseFilter && s.courseId !== courseFilter) return false;
      if (materialFilter && s.materialId !== materialFilter) return false;
      if (fromTime !== null || toTime !== null) {
        const submittedTime = new Date(s.submittedAt).getTime();
        if (fromTime !== null && submittedTime < fromTime) return false;
        if (toTime !== null && submittedTime > toTime) return false;
      }
      if (!q) return true;
      const courseTitle = s.course?.title?.toLowerCase() || "";
      const materialName = s.material?.name?.toLowerCase() || "";
      return courseTitle.includes(q) || materialName.includes(q);
    });
  }, [submissions, statusFilter, courseFilter, materialFilter, fromDate, toDate, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, courseFilter, materialFilter, fromDate, toDate, search]);

  useEffect(() => {
    if (highlightId) {
      document.getElementById(highlightId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, submissions, page]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Bài tập của tôi</h1>
        <div className="ribbon-rule mt-3" />
        <p className="mt-2 text-sm text-ink/60">
          Theo dõi các bài tập bạn đã nộp và kết quả chữa bài cho từng khoá học.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
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

          <div className="flex flex-wrap items-center gap-2 rounded-full border border-mist bg-white/60 px-3 py-1.5 sm:ml-auto">
            <DatePicker
              id="my-submissions-from"
              ariaLabel="Nộp ngày"
              placeholder="Nộp ngày"
              value={fromDate}
              max={toDate || undefined}
              onChange={setFromDate}
              className="date-picker-grouped"
            />
            <span className="text-ink/30">—</span>
            <DatePicker
              id="my-submissions-to"
              ariaLabel="Đến ngày"
              placeholder="Đến ngày"
              value={toDate}
              min={fromDate || undefined}
              onChange={setToDate}
              className="date-picker-grouped"
            />
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
                className="rounded-full px-2 py-1 text-xs font-medium text-bordeaux hover:bg-bordeaux/5"
              >
                Xoá
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={courseFilter}
            onChange={setCourseFilter}
            options={courseOptions}
            className="w-full sm:w-56"
          />

          <Select
            value={materialFilter}
            onChange={setMaterialFilter}
            options={materialOptions}
            disabled={!courseFilter}
            className="w-full sm:w-56"
          />

          <div className="relative w-full sm:ml-auto sm:w-72">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40"
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
              placeholder="Tìm theo tên khoá học, bài tập..."
              className="w-full rounded-full border border-mist bg-white py-2 pl-10 pr-8 text-sm text-ink placeholder:text-ink/40 focus:border-bordeaux/40 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader label="Đang tải danh sách..." />
      ) : error ? (
        <div className="rounded-2xl border border-mist bg-white/60 p-6 text-center">
          <p className="text-bordeaux">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
          >
            Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-mist bg-white/60 p-6 text-center text-ink/50">
          {search || statusFilter || courseFilter || materialFilter || fromDate || toDate
            ? "Không tìm thấy kết quả phù hợp."
            : 'Bạn chưa nộp bài tập nào. Vào phần "Tài liệu học" trong khoá học đã đăng ký để nộp bài.'}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {pageItems.map((s) => (
              <SubmissionCard key={s.id} submission={s} highlighted={s.id === highlightId} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}

