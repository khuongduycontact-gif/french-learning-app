/** Định dạng số tiền theo kiểu Việt Nam, hậu tố "vnđ" thống nhất trên toàn app. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} vnđ`;
}

/** Định dạng ngày kiểu Việt Nam, không kèm giờ (VD: "23/07/2026"), dùng
 * thống nhất trên toàn app cho các mốc chỉ cần hiển thị ngày. */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Định dạng ngày giờ kiểu Việt Nam (VD: "23/07/2026 14:05"), dùng cho các
 * mốc thời gian như nộp bài, chữa bài. */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Định dạng giờ học/buổi học dạng thập phân (VD: 1.5) thành chữ dễ đọc
 * (VD: "1 giờ 30 phút"), dùng thống nhất trên toàn app. */
export function formatDuration(duration: number): string {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}

/** Cắt ngắn văn bản mô tả về đúng 1 dòng theo số ký tự tối đa (ước lượng
 * theo kích thước thẻ), dùng cho phần "Mô tả" rút gọn trên các thẻ danh
 * sách - line-clamp CSS thuần không cho phép chỉ chèn "Xem thêm" khi văn
 * bản thực sự bị cắt, nên cắt thủ công theo số ký tự ở đây. */
export function truncateOneLine(
  text: string,
  maxChars: number,
): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return { text: trimmed, truncated: false };
  return { text: trimmed.slice(0, maxChars).trimEnd(), truncated: true };
}
