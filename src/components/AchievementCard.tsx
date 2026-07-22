"use client";

import { useState } from "react";
import type { Achievement } from "@/types";

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12.2l2 2 4-4.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 20.2s-7.5-4.5-9.7-9C1 8.2 2.2 5 5.4 4.4c1.8-.3 3.5.5 4.6 2C11.1 4.9 12.8 4.1 14.6 4.4 17.8 5 19 8.2 17.7 11.2c-2.2 4.5-9.7 9-9.7 9z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 12a4.2 4.2 0 100-8.4 4.2 4.2 0 000 8.4zM4 20c0-3.6 3.6-6 8-6s8 2.4 8 6v.6H4V20z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AchievementCard({ achievement }: { achievement: Achievement }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [thankYouIndex, setThankYouIndex] = useState(0);

  const thankYouUrls =
    achievement.thankYouUrls && achievement.thankYouUrls.length > 0
      ? achievement.thankYouUrls
      : [];
  const hasMultipleThankYou = thankYouUrls.length > 1;
  const currentThankYouUrl = thankYouUrls[thankYouIndex];

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setThankYouIndex((i) => (i - 1 + thankYouUrls.length) % thankYouUrls.length);
  }

  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setThankYouIndex((i) => (i + 1) % thankYouUrls.length);
  }

  return (
    <>
      <div className="group/card flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bordeaux/30 hover:shadow-lg hover:shadow-bordeaux/10">
        <div className="grid grid-cols-2 divide-x divide-mist">
          {/* Cột minh chứng */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bordeaux text-parchment">
                <ShieldCheckIcon className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-bordeaux">
                Minh chứng
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreview(achievement.evidenceUrl)}
              className="group relative aspect-square overflow-hidden bg-mist/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={achievement.evidenceUrl}
                alt={`Minh chứng của ${achievement.studentName}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
            </button>
          </div>

          {/* Cột lời cảm ơn */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bordeaux text-parchment">
                <HeartIcon className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-bordeaux">
                Lời cảm ơn
              </span>
            </div>
            <div className="relative aspect-square overflow-hidden bg-mist/30">
              {currentThankYouUrl && (
                <button
                  type="button"
                  onClick={() => setPreview(currentThankYouUrl)}
                  className="group absolute inset-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentThankYouUrl}
                    alt={`Lời cảm ơn của ${achievement.studentName}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </button>
              )}

              {hasMultipleThankYou && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Ảnh trước"
                    className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow transition hover:bg-white"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {hasMultipleThankYou && (
              <div className="flex items-center justify-center gap-1.5 py-2">
                {thankYouUrls.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setThankYouIndex(i)}
                    aria-label={`Xem ảnh ${i + 1}`}
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      i === thankYouIndex ? "bg-bordeaux" : "bg-mist"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-mist px-4 py-3.5">
          <span className="shrink-0 rounded-full border border-bordeaux/20 bg-bordeaux/10 px-3 py-1 text-xs font-semibold tracking-wide text-bordeaux">
            {achievement.level}
          </span>
          <div className="flex min-w-0 items-center gap-1.5">
            <UserIcon className="h-4 w-4 shrink-0 text-bordeaux" />
            <p className="truncate font-display text-base font-semibold text-ink">
              {achievement.studentName}
            </p>
          </div>
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
