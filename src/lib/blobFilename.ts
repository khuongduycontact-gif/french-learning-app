// Rút gọn tên tệp gốc (có thể có dấu tiếng Việt, khoảng trắng, ký tự đặc
// biệt...) thành pathname an toàn để lưu trên Vercel Blob. Tên tệp gốc hiển
// thị cho người dùng vẫn được lưu riêng (state ở client hoặc cột name/fileName
// trong DB) nên không bị ảnh hưởng bởi bước rút gọn này.
//
// File này KHÔNG import gì khác (kể cả "@vercel/blob") để có thể dùng an
// toàn trong cả server code (src/lib/blob.ts) lẫn client component (upload
// trực tiếp lên Vercel Blob qua @vercel/blob/client) — import "@vercel/blob"
// (bản server, dùng Node APIs) vào 1 "use client" component sẽ làm hỏng
// bundle phía trình duyệt.
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
