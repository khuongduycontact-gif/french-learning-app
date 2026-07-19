"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import SearchBar from "@/components/SearchBar";
import type { Course } from "@/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (level) params.set("level", level);

    const timeout = setTimeout(() => {
      fetch(`/api/courses?${params.toString()}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) => setCourses(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250); // debounce nhẹ khi gõ tìm kiếm

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q, level]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Tất cả khoá học
        </h1>
        <div className="ribbon-rule mt-3" />
      </div>

      <SearchBar value={q} onChange={setQ} level={level} onLevelChange={setLevel} />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-mist/60" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist p-10 text-center text-ink/60">
          Không tìm thấy khoá học phù hợp. Thử từ khoá khác nhé.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
