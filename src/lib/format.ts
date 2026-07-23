/** Định dạng số tiền theo kiểu Việt Nam, hậu tố "vnđ" thống nhất trên toàn app. */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} vnđ`;
}

/** Định dạng giờ học/buổi học dạng thập phân (VD: 1.5) thành chữ dễ đọc
 * (VD: "1 giờ 30 phút"), dùng thống nhất trên toàn app. */
export function formatDuration(duration: number): string {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}
