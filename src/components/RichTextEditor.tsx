"use client";

import { useRef, useState } from "react";
import { RichText } from "@/lib/richtext";

type Tool =
  | { kind: "linePrefix"; key: string; title: string; marker: string; icon: React.ReactNode }
  | { kind: "wrap"; key: string; title: string; marker: string; icon: React.ReactNode }
  | { kind: "link"; key: string; title: string; icon: React.ReactNode };

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TOOLS: Tool[] = [
  {
    kind: "linePrefix",
    key: "h1",
    title: "Tiêu đề lớn",
    marker: "# ",
    icon: <span className="text-[13px] font-bold leading-none">H1</span>,
  },
  {
    kind: "linePrefix",
    key: "h2",
    title: "Tiêu đề vừa",
    marker: "## ",
    icon: <span className="text-[13px] font-bold leading-none">H2</span>,
  },
  {
    kind: "wrap",
    key: "bold",
    title: "In đậm",
    marker: "**",
    icon: <Icon path="M5 4h5.2a2.8 2.8 0 0 1 0 5.6H5V4Zm0 5.6h5.9a2.9 2.9 0 0 1 0 5.8H5V9.6Z" />,
  },
  {
    kind: "wrap",
    key: "italic",
    title: "In nghiêng",
    marker: "*",
    icon: <Icon path="M8.5 4h5M6.5 16h5M11 4 9 16" />,
  },
  {
    kind: "linePrefix",
    key: "quote",
    title: "Trích dẫn",
    marker: "> ",
    icon: <Icon path="M6 8.5c0-1.4 1-2.5 2.5-2.5M6 8.5v3a1.5 1.5 0 0 0 1.5 1.5H8a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 8 7.5M13 8.5c0-1.4 1-2.5 2.5-2.5M13 8.5v3A1.5 1.5 0 0 0 14.5 13H15a1.5 1.5 0 0 0 1.5-1.5V9A1.5 1.5 0 0 0 15 7.5" />,
  },
  {
    kind: "linePrefix",
    key: "list",
    title: "Gạch đầu dòng",
    marker: "- ",
    icon: <Icon path="M7 5.5h9M7 10h9M7 14.5h9M4 5.5h.01M4 10h.01M4 14.5h.01" />,
  },
  {
    kind: "link",
    key: "link",
    title: "Chèn liên kết",
    icon: <Icon path="M8.5 11.5a3 3 0 0 0 4.24 0l2-2a3 3 0 0 0-4.24-4.24l-1 1M11.5 8.5a3 3 0 0 0-4.24 0l-2 2a3 3 0 0 0 4.24 4.24l1-1" />,
  },
];

export default function RichTextEditor({
  value,
  onChange,
  rows = 6,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<"write" | "preview">("write");

  function applyTool(tool: Tool) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let nextValue: string;
    let nextStart: number;
    let nextEnd: number;

    if (tool.kind === "wrap") {
      const text = selected || "chữ";
      nextValue = value.slice(0, start) + tool.marker + text + tool.marker + value.slice(end);
      nextStart = start + tool.marker.length;
      nextEnd = nextStart + text.length;
    } else if (tool.kind === "link") {
      const text = selected || "văn bản";
      const url = "https://";
      nextValue = value.slice(0, start) + `[${text}](${url})` + value.slice(end);
      nextStart = start + `[${text}](`.length;
      nextEnd = nextStart + url.length;
    } else {
      // linePrefix: thêm ký hiệu vào đầu mỗi dòng đang được chọn (hoặc dòng hiện tại)
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEndIdx = value.indexOf("\n", end);
      const blockEnd = lineEndIdx === -1 ? value.length : lineEndIdx;
      const block = value.slice(lineStart, blockEnd);
      const prefixed = block
        .split("\n")
        .map((line) => (line.startsWith(tool.marker) ? line : tool.marker + line))
        .join("\n");
      nextValue = value.slice(0, lineStart) + prefixed + value.slice(blockEnd);
      nextStart = lineStart;
      nextEnd = lineStart + prefixed.length;
    }

    onChange(nextValue);
    // Đợi React render lại giá trị mới rồi mới đặt lại con trỏ/vùng chọn
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(nextStart, nextEnd);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 border-b border-mist bg-parchment/70 px-1.5 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {TOOLS.map((tool, i) => (
            <span key={tool.key} className="flex items-center">
              {(i === 2 || i === 4 || i === 5) && (
                <span className="mx-1 h-5 w-px bg-mist" aria-hidden="true" />
              )}
              <button
                type="button"
                title={tool.title}
                disabled={mode === "preview"}
                onClick={() => applyTool(tool)}
                className="flex h-8 min-w-[2rem] items-center justify-center rounded-lg px-2 text-ink/80 transition hover:bg-white hover:text-bordeaux disabled:cursor-not-allowed disabled:opacity-40"
              >
                {tool.icon}
              </button>
            </span>
          ))}
        </div>

        <div className="flex overflow-hidden rounded-lg border border-mist bg-white text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={`px-3 py-1.5 transition ${
              mode === "write" ? "bg-ink text-parchment" : "text-ink/60 hover:bg-mist/60"
            }`}
          >
            Soạn thảo
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-3 py-1.5 transition ${
              mode === "preview" ? "bg-ink text-parchment" : "text-ink/60 hover:bg-mist/60"
            }`}
          >
            Xem trước
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <textarea
          ref={ref}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full resize-y bg-white px-4 py-3 text-sm text-ink outline-none transition focus:bg-parchment/30"
        />
      ) : (
        <div
          className="px-4 py-3 text-sm text-ink"
          style={{ minHeight: `${rows * 1.6 + 1}rem` }}
        >
          {value.trim() ? (
            <RichText content={value} />
          ) : (
            <p className="italic text-ink/40">Chưa có nội dung để xem trước.</p>
          )}
        </div>
      )}
    </div>
  );
}
