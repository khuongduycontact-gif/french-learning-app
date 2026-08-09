import { put } from "@vercel/blob";

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

// Rút gọn tên tệp gốc (có thể có dấu tiếng Việt, khoảng trắng, ký tự đặc
// biệt...) thành pathname an toàn để lưu trên Vercel Blob. Tên tệp gốc hiển
// thị cho người dùng (VD: "Bài 1 - Ngữ pháp.docx") vẫn được lưu riêng ở cột
// name/fileName trong cơ sở dữ liệu nên không bị ảnh hưởng bởi bước rút gọn
// này.
export function sanitizeBlobFilename(filename: string): string {
  const idx = filename.lastIndexOf(".");
  const base = idx > 0 ? filename.slice(0, idx) : filename;
  const ext = idx > 0 ? filename.slice(idx).replace(/[^a-zA-Z0-9.]/g, "") : "";

  const safeBase =
    base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (chữ cái Latin có dấu)
      .replace(/[đĐ]/g, "d") // "đ" không tách dấu được bằng NFD
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "tep";

  return `${safeBase}${ext}`;
}

// Tải 1 tệp raw (PDF, Word, PowerPoint, file nén, âm thanh...) lên Vercel
// Blob, đặt trong "thư mục" ảo (prefix) theo mục đích sử dụng, ví dụ:
// "materials" (tài liệu học/bài tập giao/sách), "submissions" (bài nộp/bài
// đã chữa). Dùng addRandomSuffix để tránh trùng tên giữa nhiều lượt tải lên,
// tương đương unique_filename: true trước đây bên Cloudinary.
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
