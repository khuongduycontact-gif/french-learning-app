/** Định dạng số tiền theo kiểu Việt Nam, hậu tố "vnđ" thống nhất trên toàn app. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} vnđ`;
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
