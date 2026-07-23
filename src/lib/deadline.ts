// Tiện ích tính toán hạn nộp bài (48 tiếng kể từ khi học viên tải/xem tài
// liệu bài tập lần đầu). Dùng chung cho cả client (đếm ngược) và server
// (kiểm tra khoá tính năng nộp bài).

export interface DeadlineInfo {
  startedAt: string; // ISO
  hours: number;
}

/** Thời điểm hết hạn nộp bài (mốc startedAt + số giờ được phép). */
export function getDeadlineDate(info: DeadlineInfo): Date {
  return new Date(new Date(info.startedAt).getTime() + info.hours * 60 * 60 * 1000);
}

/** true nếu đã quá hạn nộp bài tại thời điểm gọi hàm. */
export function isDeadlinePassed(info: DeadlineInfo): boolean {
  return getDeadlineDate(info).getTime() <= Date.now();
}

/** Số mili-giây còn lại trước khi hết hạn (0 nếu đã hết hạn). */
export function getRemainingMs(info: DeadlineInfo): number {
  return Math.max(0, getDeadlineDate(info).getTime() - Date.now());
}

/** Định dạng thời gian còn lại kiểu "47 giờ 12 phút" / "35 phút" / "Đã hết hạn". */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Đã hết hạn";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours <= 0) return `${minutes} phút`;
  if (minutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${minutes} phút`;
}
