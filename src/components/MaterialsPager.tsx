"use client";

import { useState } from "react";
import MaterialFileAction from "./MaterialFileAction";

type MaterialFile = { url: string; name?: string; type?: string };

type Material = {
  id: string;
  name: string;
  description: string | null;
  files: MaterialFile[];
};

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

export default function MaterialsPager({
  materials,
  watermarkLabel,
}: {
  materials: Material[];
  watermarkLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const total = materials.length;
  const current = materials[index];

  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink/60">
          Bài {index + 1}/{total}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-mist bg-white/60 p-4">
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{current.name}</p>
          {current.description && (
            <p className="mt-0.5 text-sm text-ink/60">{current.description}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {current.files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white px-3 py-2"
            >
              <span className="min-w-0 truncate text-sm text-ink">
                {f.name || `Tệp ${i + 1}`}
              </span>
              <MaterialFileAction
                url={f.url}
                name={f.name}
                type={f.type}
                watermarkLabel={watermarkLabel}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-mist bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-mist/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={isLast}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-bordeaux px-4 py-2 text-sm font-medium text-parchment transition hover:bg-bordeaux/90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-bordeaux"
        >
          Tiếp tục
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
