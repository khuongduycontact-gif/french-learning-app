import { put } from "@vercel/blob";
import { sanitizeBlobFilename } from "./blobFilename";

export { sanitizeBlobFilename };

// Vercel Blob dùng để lưu các tệp "raw" (tài liệu học, sách, bài tập giao,
// bài tập học sinh nộp / bài đã chữa) — thay cho Cloudinary trước đây. Ảnh
// và video giới thiệu khoá học vẫn lưu trên Cloudinary (xem lib/cloudinary.ts)
// vì Cloudinary có sẵn tối ưu/biến đổi cho ảnh và video mà Vercel Blob không
// hỗ trợ. Cần biến môi trường BLOB_READ_WRITE_TOKEN (xem README) — khi
// deploy trên Vercel và đã kết nối Blob store với project thì biến này được
// tự động cấp, không cần khai báo thủ công.

// Hostname công khai của Vercel Blob (dạng https://<store-id>.public.blob.vercel-storage.com/...),
// dùng để nhận diện URL tệp raw khi proxy tải xuống ở /api/download (chặn
// SSRF: chỉ cho phép proxy các host đã biết trước, xem route đó).
const VERCEL_BLOB_HOSTNAME_SUFFIX = ".public.blob.vercel-storage.com";

export function isVercelBlobUrl(hostname: string): boolean {
  return hostname.toLowerCase().endsWith(VERCEL_BLOB_HOSTNAME_SUFFIX);
}

// Tải 1 tệp raw (PDF, Word, PowerPoint, file nén, âm thanh...) lên Vercel
// Blob, đặt trong "thư mục" ảo (prefix) theo mục đích sử dụng, ví dụ:
// "materials" (tài liệu học/bài tập giao/sách), "submissions" (bài nộp/bài
// đã chữa). Dùng addRandomSuffix để tránh trùng tên giữa nhiều lượt tải lên,
// tương đương unique_filename: true trước đây bên Cloudinary.
//
// LƯU Ý: kể từ khi chuyển sang client upload trực tiếp (xem
// src/app/api/upload/client/route.ts và src/app/api/submissions/upload/client/route.ts),
// hàm này không còn được các route /api/upload và /api/submissions/upload
// gọi cho nhánh tài liệu (isDoc) nữa — vì tải qua server sẽ dính giới hạn
// body 4.5MB của Vercel Functions. Giữ lại đây vì vẫn là tiện ích hợp lệ nếu
// sau này cần upload tài liệu từ phía server (script, cron...).
export async function uploadRawToBlob(
  folder: string,
  file: File
): Promise<{ url: string }> {
  const safeName = sanitizeBlobFilename(file.name || "tep");
  const blob = await put(`bonjour-francais/${folder}/${safeName}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || undefined,
  });
  return { url: blob.url };
}
