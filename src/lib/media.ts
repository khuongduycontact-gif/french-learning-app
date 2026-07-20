// Đoán loại tệp (ảnh/video) dựa vào URL — dùng chung cho mọi nơi hiển thị
// ảnh/video giới thiệu khoá học (admin form, thẻ khoá học, trang chi tiết...).
export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");
}

// Đoán tệp có phải ảnh dựa vào URL — dùng khi tệp tài liệu học không có
// sẵn MIME type (dữ liệu cũ) và cần đoán dựa vào phần đuôi mở rộng.
export function isImageUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    /\.(jpe?g|png|gif|webp|avif|svg|bmp)(\?|$)/i.test(url) ||
    url.includes("/image/upload/")
  );
}

export type MediaKind = "image" | "video" | "other";

// Xác định loại tài liệu học (ảnh/video/khác) để quyết định hiển thị nút
// "Xem" (trình xem an toàn, không cho tải) hay nút "Tải xuống" (các tệp
// văn bản như PDF, Word, PowerPoint, file nén...). Ưu tiên MIME type trả về
// từ API upload, nếu thiếu thì đoán theo đuôi URL.
export function getMediaKind(file: { url?: string | null; type?: string | null }): MediaKind {
  const mime = file.type || "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (isVideoUrl(file.url)) return "video";
  if (isImageUrl(file.url)) return "image";
  return "other";
}
