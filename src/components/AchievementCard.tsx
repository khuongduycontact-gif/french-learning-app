"use client";

import { useState } from "react";
import type { Achievement } from "@/types";

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <div className="group/card flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bordeaux/30 hover:shadow-lg hover:shadow-bordeaux/10">
        <div className="grid grid-cols-2 gap-px bg-mist">
          <button
            type="button"
            onClick={() => setPreview(achievement.evidenceUrl)}
            className="group relative aspect-square overflow-hidden bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={achievement.evidenceUrl}
              alt={`Minh chứng của ${achievement.studentName}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-80 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-parchment backdrop-blur-sm">
              Minh chứng
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPreview(achievement.thankYouUrl)}
            className="group relative aspect-square overflow-hidden bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={achievement.thankYouUrl}
              alt={`Lời cảm ơn của ${achievement.studentName}`}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-ink/0 opacity-80 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-2 left-2 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-parchment backdrop-blur-sm">
              Lời cảm ơn
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3.5">
          <span className="shrink-0 rounded-full border border-bordeaux/20 bg-bordeaux/10 px-3 py-1 text-xs font-semibold tracking-wide text-bordeaux">
            {achievement.level}
          </span>
          <p className="truncate text-right font-display text-base font-semibold text-ink">
            {achievement.studentName}
          </p>
        </div>
      </div>

      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPreview(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/80 p-6"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="Đóng"
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-parchment hover:bg-white/20"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
