"use client";

import { useRef } from "react";

type WrapMode = "wrap" | "linePrefix";

const TOOLS: {
  label: string;
  title: string;
  mode: WrapMode;
  marker: string;
  className?: string;
}[] = [
  { label: "H1", title: "Tiêu đề lớn", mode: "linePrefix", marker: "# " },
  { label: "H2", title: "Tiêu đề vừa", mode: "linePrefix", marker: "## " },
  { label: "B", title: "In đậm", mode: "wrap", marker: "**", className: "font-bold" },
  { label: "I", title: "In nghiêng", mode: "wrap", marker: "*", className: "italic" },
  { label: "•", title: "Gạch đầu dòng", mode: "linePrefix", marker: "- " },
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

  function applyTool(tool: (typeof TOOLS)[number]) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    let nextValue: string;
    let nextStart: number;
    let nextEnd: number;

    if (tool.mode === "wrap") {
      const text = selected || "chữ";
      nextValue = value.slice(0, start) + tool.marker + text + tool.marker + value.slice(end);
      nextStart = start + tool.marker.length;
      nextEnd = nextStart + text.length;
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
    <div className="overflow-hidden rounded-lg border border-mist bg-white">
      <div className="flex flex-wrap gap-1 border-b border-mist bg-mist/40 p-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.label}
            type="button"
            title={tool.title}
            onClick={() => applyTool(tool)}
            className={`min-w-[2rem] rounded-md px-2 py-1 text-sm text-ink hover:bg-white ${tool.className || ""}`}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-y px-4 py-2.5 text-sm outline-none"
      />
      <p className="border-t border-mist px-4 py-1.5 text-xs text-ink/50">
        Hỗ trợ: # tiêu đề lớn, ## tiêu đề vừa, **đậm**, *nghiêng*, - gạch đầu dòng, xuống dòng để tách dòng/đoạn.
      </p>
    </div>
  );
}
