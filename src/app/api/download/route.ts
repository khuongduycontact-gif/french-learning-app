import { NextRequest, NextResponse } from "next/server";

// Bắt buộc chạy trên Node.js runtime để dùng được stream khi proxy tệp
export const runtime = "nodejs";

// LÝ DO CẦN ROUTE NÀY: các tệp tài liệu (Word, PowerPoint, PDF, file nén...)
// được lưu trên Cloudinary dưới dạng "raw". Nếu cho học viên bấm thẳng vào
// đường dẫn Cloudinary, trình duyệt không nhận diện được đúng đuôi tệp/
// loại tệp (Content-Type), nên khi tải về máy tệp bị thiếu đuôi mở rộng
// hoặc bị trình duyệt cố mở luôn trong tab thay vì tải xuống — kết quả là
// tệp tải về không mở được. Route này tải tệp gốc về từ server rồi trả lại
// cho trình duyệt kèm đúng tên tệp, đúng đuôi mở rộng và header
// Content-Disposition: attachment để trình duyệt luôn tải xuống đúng định
// dạng, mở ra xem được ngay.

const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain; charset=utf-8",
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  aac: "audio/aac",
  ogg: "audio/ogg",
  flac: "audio/flac",
  wma: "audio/x-ms-wma",
};

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx > 0 ? filename.slice(idx + 1).toLowerCase() : "";
}

function guessMimeType(filename: string): string {
  const ext = getExtension(filename);
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

function sanitizeFilename(name: string): string {
  // Bỏ ký tự có thể phá header (dấu ngoặc kép, xuống dòng, dấu /)
  return name.replace(/["\r\n/\\]/g, "").trim();
}

// Chỉ chấp nhận tên tệp không có đuôi mở rộng phù hợp -> vẫn giữ nguyên đuôi
// gốc lấy từ URL, tránh trường hợp tên tài liệu người quản trị đặt không kèm
// đuôi tệp.
function resolveFilename(requestedName: string, url: URL): string {
  const fallback = decodeURIComponent(url.pathname.split("/").pop() || "tai-lieu");
  const base = sanitizeFilename(requestedName) || fallback;
  if (getExtension(base)) return base;
  const fallbackExt = getExtension(fallback);
  return fallbackExt ? `${base}.${fallbackExt}` : base;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url") || "";
  const requestedName = searchParams.get("name") || "";

  if (!fileUrl) {
    return NextResponse.json({ error: "Thiếu đường dẫn tệp" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return NextResponse.json({ error: "Đường dẫn tệp không hợp lệ" }, { status: 400 });
  }

  // Chỉ cho phép proxy tải tệp từ Cloudinary của ứng dụng, tránh bị lợi
  // dụng làm proxy tải tệp tuỳ ý từ nơi khác (SSRF).
  if (!/(^|\.)res\.cloudinary\.com$/i.test(parsed.hostname)) {
    return NextResponse.json({ error: "Đường dẫn tệp không hợp lệ" }, { status: 400 });
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Không tải được tệp gốc" }, { status: 502 });
    }

    const filename = resolveFilename(requestedName, parsed);
    const contentType = guessMimeType(filename);
    const asciiFallback = filename.replace(/[^\x20-\x7E]/g, "_");

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(
          filename
        )}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Lỗi proxy tải tệp:", err);
    return NextResponse.json(
      { error: "Tải tệp thất bại, vui lòng thử lại." },
      { status: 500 }
    );
  }
}
