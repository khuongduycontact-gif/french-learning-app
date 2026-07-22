"use client";

import { useState } from "react";
import type { Achievement } from "@/types";

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-2xl border border-mist bg-white/70 shadow-sm transition hover:shadow-md">
        <div className="grid grid-cols-2 gap-0.5 bg-mist">
          <button
            type="button"
            onClick={() => setPreview(achievement.evidenceUrl)}
            className="group relative aspect-square overflow-hidden bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={achievement.evidenceUrl}
              alt={`Minh chứng của ${achievement.studentName}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-parchment">
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
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-parchment">
              Lời cảm ơn
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <p className="truncate font-medium text-ink">{achievement.studentName}</p>
          <span className="shrink-0 rounded-full bg-bordeaux/10 px-3 py-1 text-xs font-semibold text-bordeaux">
            {achievement.level}
          </span>
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
