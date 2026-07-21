"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CourseCard from "@/components/CourseCard";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import { enrollmentStatusMap } from "@/lib/enrollmentStatus";
import type { Course } from "@/types";

const PAGE_SIZE = 6;

export default function CoursesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin");
    }
  }, [session, router]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (level) params.set("level", level);
    if (sort) params.set("sort", sort);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/courses?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách khoá học.");
          return res.json();
        })
        .then((data) => {
          setCourses(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          // Yêu cầu cũ bị huỷ (do gõ tìm kiếm mới hoặc rời trang) -> bỏ qua hoàn toàn,
          // không được ghi đè state của yêu cầu mới hơn
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách khoá học, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }

    const timeout = setTimeout(run, 250); // debounce nhẹ khi gõ tìm kiếm

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, level, sort, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const pageCourses = courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Tất cả khoá học
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>

      <SearchBar
        value={q}
        onChange={setQ}
        level={level}
        onLevelChange={setLevel}
        sort={sort}
        onSortChange={setSort}
      />

      {loading ? (
        <Loader label="Đang tải khoá học..." />
      ) : error ? (
        <div className="rounded-2xl border border-dashed border-bordeaux/40 p-10 text-center">
          <p className="text-bordeaux">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 rounded-full border border-bordeaux/40 px-4 py-2 text-sm font-medium text-bordeaux hover:bg-bordeaux/5"
          >
            Thử lại
          </button>
        </div>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist p-10 text-center text-ink/60">
          Không tìm thấy khoá học phù hợp. Thử từ khoá khác nhé.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pageCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                statusBadge={
                  c.myEnrollmentStatus
                    ? enrollmentStatusMap[c.myEnrollmentStatus]
                    : undefined
                }
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
