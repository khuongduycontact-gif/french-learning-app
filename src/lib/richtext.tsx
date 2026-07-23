import React from "react";

/**
 * Định dạng văn bản đơn giản kiểu Markdown được hỗ trợ:
 *  - "# " / "## "  -> Tiêu đề lớn / tiêu đề vừa
 *  - "**chữ**"     -> In đậm
 *  - "*chữ*"       -> In nghiêng
 *  - "- " / "* "   -> Gạch đầu dòng (đầu một dòng)
 *  - Xuống dòng thường -> <br />, dòng trống -> tách đoạn văn mới
 *
 * Được dùng đồng bộ giữa RichTextEditor (nhập ở trang admin)
 * và RichText (hiển thị ở trang cho học viên).
 */

// Chuyển các ký hiệu in đậm/in nghiêng trong một dòng thành các node React,
// đồng thời escape để không lỡ chèn HTML từ nội dung người dùng nhập.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Khớp [chữ](url), **đậm** hoặc *nghiêng*, ưu tiên link trước, rồi ** vì dài hơn *
  const pattern = /\[(.+?)\]\((.+?)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <a
          key={`${keyPrefix}-a-${i++}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bordeaux hover:text-bordeaux/80"
        >
          {match[1]}
        </a>
      );
    } else if (match[3] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b-${i++}`}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-i-${i++}`}>{match[4]}</em>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; lines: string[] }
  | { type: "p"; lines: string[] };

function parseBlocks(content: string): Block[] {
  const rawLines = (content || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2) });
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-*]\s+/.test(rawLines[i])) {
        items.push(rawLines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const lines: string[] = [];
      while (i < rawLines.length && /^>\s?/.test(rawLines[i])) {
        lines.push(rawLines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines });
      continue;
    }

    // Đoạn văn: gom các dòng liên tiếp không trống, không phải tiêu đề/list/trích dẫn
    const lines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== "" &&
      !rawLines[i].startsWith("# ") &&
      !rawLines[i].startsWith("## ") &&
      !/^[-*]\s+/.test(rawLines[i]) &&
      !/^>\s?/.test(rawLines[i])
    ) {
      lines.push(rawLines[i]);
      i++;
    }
    blocks.push({ type: "p", lines });
  }

  return blocks;
}

/** Hiển thị nội dung mô tả có định dạng (dùng ở trang cho học viên xem). */
export function RichText({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = parseBlocks(content);

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        if (block.type === "h1") {
          return (
            <h2 key={bi} className="mt-5 font-display text-2xl font-semibold text-ink first:mt-0">
              {renderInline(block.text, `${bi}`)}
            </h2>
          );
        }
        if (block.type === "h2") {
          return (
            <h3 key={bi} className="mt-4 font-display text-xl font-semibold text-ink first:mt-0">
              {renderInline(block.text, `${bi}`)}
            </h3>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={bi}
              className="mt-3 border-l-2 border-bordeaux/50 pl-4 italic text-ink/70 first:mt-0"
            >
              {block.lines.map((line, li) => (
                <React.Fragment key={li}>
                  {li > 0 && <br />}
                  {renderInline(line, `${bi}-${li}`)}
                </React.Fragment>
              ))}
            </blockquote>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={bi} className="mt-3 list-disc space-y-1 pl-5 first:mt-0">
              {block.items.map((item, ii) => (
                <li key={ii}>{renderInline(item, `${bi}-${ii}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi} className="mt-3 leading-relaxed first:mt-0">
            {block.lines.map((line, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, `${bi}-${li}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Bỏ hết ký hiệu định dạng, dùng cho các bản xem trước ngắn (VD: thẻ khoá học). */
export function stripRichText(content: string): string {
  return (content || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/^#{1,2}\s+/, "")
        .replace(/^[-*]\s+/, "")
        .replace(/^>\s?/, "")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
