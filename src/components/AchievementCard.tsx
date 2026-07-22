"use client";

import { useEffect, useRef, useState } from "react";
import type { Achievement } from "@/types";

const AUTOPLAY_INTERVAL_MS = 2000;

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
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
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStartXRef = useRef(0);
  const didDragRef = useRef(false);
  const trackWidthRef = useRef(1);

  const thankYouUrls =
    achievement.thankYouUrls && achievement.thankYouUrls.length > 0
      ? achievement.thankYouUrls
      : [];
  const hasMultipleThankYou = thankYouUrls.length > 1;

  // Tự động chạy slider mỗi 2s, chạy nối vòng tròn, dừng khi hover/kéo vào
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hasMultipleThankYou || isHovering || isDragging) return;

    intervalRef.current = setInterval(() => {
      setThankYouIndex((i) => (i + 1) % thankYouUrls.length);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hasMultipleThankYou, isHovering, isDragging, thankYouUrls.length]);

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setThankYouIndex((i) => (i - 1 + thankYouUrls.length) % thankYouUrls.length);
  }

  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setThankYouIndex((i) => (i + 1) % thankYouUrls.length);
  }

  function onTrackPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!hasMultipleThankYou) return;
    setIsHovering(true);
    setIsDragging(true);
    didDragRef.current = false;
    dragStartXRef.current = e.clientX;
    trackWidthRef.current = e.currentTarget.offsetWidth || 1;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onTrackPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const delta = e.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 5) didDragRef.current = true;
    setDragX(delta);
  }

  function endDrag() {
    if (!isDragging) return;
    const threshold = trackWidthRef.current * 0.18;
    if (dragX <= -threshold) {
      setThankYouIndex((i) => (i + 1) % thankYouUrls.length);
    } else if (dragX >= threshold) {
      setThankYouIndex((i) => (i - 1 + thankYouUrls.length) % thankYouUrls.length);
    }
    setIsDragging(false);
    setDragX(0);
    setIsHovering(false);
  }

  return (
    <>
      <div className="group/card flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-bordeaux/30 hover:shadow-lg hover:shadow-bordeaux/10">
        <div className="grid grid-cols-2 gap-2 p-2">
          {/* Cột minh chứng */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-mist">
            <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
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
          <div className="flex flex-col overflow-hidden rounded-xl border border-mist">
            <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bordeaux text-parchment">
                <HeartIcon className="h-3 w-3" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-bordeaux">
                Lời cảm ơn
              </span>
            </div>
            <div
              className="relative aspect-square touch-pan-y select-none overflow-hidden bg-mist/30"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={() => isDragging && endDrag()}
            >
              {thankYouUrls.length > 0 && (
                <div
                  className="flex h-full"
                  style={{
                    transform: `translateX(calc(${-thankYouIndex * 100}% + ${dragX}px))`,
                    transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {thankYouUrls.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      onClick={() => {
                        if (!didDragRef.current) setPreview(url);
                      }}
                      className="group relative h-full w-full shrink-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Lời cảm ơn của ${achievement.studentName}`}
                        draggable={false}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              )}

              {hasMultipleThankYou && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Ảnh trước"
                    className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white/90 backdrop-blur-sm transition hover:bg-white/35"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Ảnh tiếp theo"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white/90 backdrop-blur-sm transition hover:bg-white/35"
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
