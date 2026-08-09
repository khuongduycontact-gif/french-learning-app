import { NextRequest, NextResponse } from "next/server";
import { getPresignedDownloadUrl, isAppObjectKey, isLegacyVercelBlobHost } from "@/lib/b2";

// Bắt buộc chạy trên Node.js runtime để dùng được stream khi proxy tệp
export const runtime = "nodejs";

// LÝ DO CẦN ROUTE NÀY: các tệp tài liệu (Word, PowerPoint, PDF, file nén...)
// được lưu trên Backblaze B2 dưới dạng "raw" (tệp cũ tải lên trước khi
// chuyển từ Vercel Blob sang B2 vẫn còn nằm trên Vercel Blob/Cloudinary, xem
// lib/b2.ts). Nếu cho học viên bấm thẳng vào đường dẫn gốc, trình duyệt
// không nhận diện được đúng đuôi tệp/loại tệp (Content-Type), nên khi tải về
// máy tệp bị thiếu đuôi mở rộng hoặc bị trình duyệt cố mở luôn trong tab
// thay vì tải xuống — kết quả là tệp tải về không mở được. Route này tải
// tệp gốc về từ server rồi trả lại cho trình duyệt kèm đúng tên tệp, đúng
// đuôi mở rộng và header Content-Disposition: attachment để trình duyệt
// luôn tải xuống đúng định dạng, mở ra xem được ngay.
//
// Bucket B2 đặt ở chế độ PRIVATE nên còn thêm 1 lý do bắt buộc phải có route
// này: trình duyệt không thể tự fetch thẳng tệp từ B2 (sẽ bị từ chối truy
// cập) — phải qua server, dùng thông tin xác thực B2 để tạo 1 URL tải xuống
// có chữ ký tạm thời (presigned URL) rồi mới lấy được nội dung tệp.

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
// gốc lấy từ đường dẫn nguồn (URL Cloudinary/Vercel Blob cũ, hoặc object key
// B2), tránh trường hợp tên tài liệu người quản trị đặt không kèm đuôi tệp.
function resolveFilename(requestedName: string, sourcePath: string): string {
  const fallback = decodeURIComponent(sourcePath.split("/").pop() || "tai-lieu");
  const base = sanitizeFilename(requestedName) || fallback;
  if (getExtension(base)) return base;
  const fallbackExt = getExtension(fallback);
  return fallbackExt ? `${base}.${fallbackExt}` : base;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileRef = searchParams.get("url") || "";
  const requestedName = searchParams.get("name") || "";

  if (!fileRef) {
    return NextResponse.json({ error: "Thiếu đường dẫn tệp" }, { status: 400 });
  }

  let upstreamUrl: string;
  let sourcePathForName: string;

  if (/^https?:\/\//i.test(fileRef)) {
    // Trường hợp 1: tệp cũ còn URL đầy đủ (Cloudinary, hoặc Vercel Blob từ
    // trước khi chuyển sang B2) — cả 2 đều là host công khai, proxy fetch
    // trực tiếp như trước.
    let parsed: URL;
    try {
      parsed = new URL(fileRef);
    } catch {
      return NextResponse.json({ error: "Đường dẫn tệp không hợp lệ" }, { status: 400 });
    }

    // Chỉ cho phép các host đã biết trước, tránh bị lợi dụng làm proxy tải
    // tệp tuỳ ý từ nơi khác (SSRF).
    const isAllowedHost =
      /(^|\.)res\.cloudinary\.com$/i.test(parsed.hostname) || isLegacyVercelBlobHost(parsed.hostname);
    if (!isAllowedHost) {
      return NextResponse.json({ error: "Đường dẫn tệp không hợp lệ" }, { status: 400 });
    }

    upstreamUrl = parsed.toString();
    sourcePathForName = parsed.pathname;
  } else {
    // Trường hợp 2: object key trên Backblaze B2 (bucket Private) — giá trị
    // lưu trong DB không phải URL, phải tạo URL tải xuống có chữ ký tạm
    // thời (presigned URL) mới đọc được nội dung tệp.
    if (!isAppObjectKey(fileRef)) {
      return NextResponse.json({ error: "Đường dẫn tệp không hợp lệ" }, { status: 400 });
    }

    try {
      upstreamUrl = await getPresignedDownloadUrl(fileRef);
    } catch (err) {
      console.error("Lỗi tạo URL tải tệp từ Backblaze B2:", err);
      return NextResponse.json({ error: "Tải tệp thất bại, vui lòng thử lại." }, { status: 500 });
    }
    sourcePathForName = fileRef;
  }

  try {
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Không tải được tệp gốc" }, { status: 502 });
    }

    const filename = resolveFilename(requestedName, sourcePathForName);
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
