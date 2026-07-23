"use client";

import { useEffect, useRef, useState } from "react";
import AchievementCard from "@/components/AchievementCard";
import Loader from "@/components/Loader";
import Pagination from "@/components/Pagination";
import type { Achievement } from "@/types";

const PAGE_SIZE = 12;

const LEVEL_OPTIONS = [
  { value: "", label: "Tất cả trình độ" },
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (level) params.set("level", level);

    function run() {
      setLoading(true);
      setError("");
      fetch(`/api/achievements?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Không tải được danh sách thành tích.");
          return res.json();
        })
        .then((data) => {
          setAchievements(data);
          setPage(1);
          setLoading(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError" || controller.signal.aborted) return;
          setError("Không tải được danh sách thành tích, vui lòng thử lại.");
          setLoading(false);
        });
    }

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      run();
      return () => controller.abort();
    }

    const t = setTimeout(run, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [level, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(achievements.length / PAGE_SIZE));
  const pageAchievements = achievements.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Thành tích học viên
        </h1>
        <div className="ribbon-rule mt-3" />
        <p className="mt-3 max-w-2xl text-sm text-ink/70">
          Những khoảnh khắc và lời cảm ơn từ các bạn học viên đã đạt được thành tích
          trong quá trình học tiếng Pháp tại{" "}
          <a
            href="https://francaisavecceline.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap"
          >
            <span className="font-display font-semibold text-ink">Français</span>{" "}
            <span className="font-display italic text-bordeaux">avec Céline</span>
          </a>
          .
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          id="level-filter"
          aria-label="Lọc theo trình độ"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="rounded-full border border-mist bg-white px-5 py-2.5 text-sm text-ink outline-none transition focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20"
        >
          {LEVEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Đang tải thành tích..." />
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
      ) : achievements.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-mist p-10 text-center text-ink/60">
          Chưa có thành tích nào phù hợp.
        </p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageAchievements.map((a) => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
