// Rút gọn tên tệp gốc (có thể có dấu tiếng Việt, khoảng trắng, ký tự đặc
// biệt...) thành phần tên an toàn để dùng trong object key khi lưu trên
// Backblaze B2 (xem src/lib/b2.ts). Tên tệp gốc hiển thị cho người dùng vẫn
// được lưu riêng (state ở client hoặc cột name/fileName trong DB) nên không
// bị ảnh hưởng bởi bước rút gọn này.
//
// File này KHÔNG import gì khác (kể cả "@aws-sdk/client-s3") — dù hiện chỉ
// còn được server code (src/lib/b2.ts) dùng, giữ nguyên tắc "không phụ
// thuộc" này để có thể an toàn import lại từ client component sau này nếu
// cần, mà không kéo theo SDK chỉ chạy được ở server vào bundle trình duyệt.
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
