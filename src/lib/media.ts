// Đoán loại tệp (ảnh/video) dựa vào URL — dùng chung cho mọi nơi hiển thị
// ảnh/video giới thiệu khoá học (admin form, thẻ khoá học, trang chi tiết...).
export function isVideoUrl(url?: string | null): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || url.includes("/video/upload/");
}
