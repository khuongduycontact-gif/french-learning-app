import type { StudentSchedule } from "@/types";

export const WEEKDAY_LABELS_SHORT = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

export const WEEKDAY_LABELS_FULL = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Thứ trong tuần, quy về 0 = Thứ Hai .. 6 = Chủ Nhật (khác getDay() gốc của JS vốn 0 = Chủ Nhật). */
export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Ngày đầu tuần (Thứ Hai) chứa `date`. */
export function startOfWeek(date: Date): Date {
  const d = stripTime(date);
  d.setDate(d.getDate() - mondayIndex(d));
  return d;
}

/** Danh sách 7 ngày (Thứ Hai -> Chủ Nhật) của tuần chứa `date`. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "yyyy-mm-dd" theo giờ địa phương (không dùng toISOString() vì nó quy đổi theo UTC, có thể lệch ngày). */
export function toISODateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** VD: "Thứ Hai, 04/08/2026" - dùng ngay trên ô chọn ngày để admin luôn thấy rõ thứ. */
export function formatWeekdayDate(date: Date): string {
  const weekday = WEEKDAY_LABELS_FULL[mondayIndex(date)];
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${weekday}, ${d}/${m}/${date.getFullYear()}`;
}

/** "HH:mm" theo giờ địa phương. */
export function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// Việt Nam luôn là UTC+7, không có giờ mùa hè, nên có thể quy đổi bằng 1
// phép cộng giờ cố định thay vì cần thư viện timezone.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Quy đổi 1 thời điểm tuyệt đối (epoch) về "đồng hồ tường" giờ Việt Nam,
 * BẤT KỂ code đang chạy ở múi giờ nào. formatTime()/formatWeekdayDate() ở
 * trên dùng getHours()/getDate() theo múi giờ của máy đang chạy code - khi
 * chạy trên trình duyệt của người dùng ở Việt Nam thì đúng, nhưng khi chạy
 * trên server (VD: route cron gửi mail nhắc lịch trên Vercel, mặc định
 * chạy giờ UTC) thì sẽ lệch 7 tiếng (VD 22:00 giờ VN bị hiển thị thành
 * 15:00). Dùng toVNWallClock() + các hàm ...VN bên dưới ở bất kỳ chỗ nào
 * format thời gian ngoài trình duyệt để luôn ra đúng giờ Việt Nam.
 */
function toVNWallClock(date: Date): Date {
  return new Date(date.getTime() + VN_OFFSET_MS);
}

/** Giống formatWeekdayDate() nhưng luôn ra đúng giờ Việt Nam dù chạy ở server múi giờ khác (dùng cho mail nhắc lịch). */
export function formatWeekdayDateVN(date: Date): string {
  const vn = toVNWallClock(date);
  const weekday = WEEKDAY_LABELS_FULL[(vn.getUTCDay() + 6) % 7];
  const d = String(vn.getUTCDate()).padStart(2, "0");
  const m = String(vn.getUTCMonth() + 1).padStart(2, "0");
  return `${weekday}, ${d}/${m}/${vn.getUTCFullYear()}`;
}

/** Giống formatTime() nhưng luôn ra đúng giờ Việt Nam dù chạy ở server múi giờ khác (dùng cho mail nhắc lịch). */
export function formatTimeVN(date: Date): string {
  const vn = toVNWallClock(date);
  const h = String(vn.getUTCHours()).padStart(2, "0");
  const m = String(vn.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(weekStart.getDate() + 6);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

/**
 * Gom các buổi học theo từng ngày trong tuần và tự tính số thứ tự ca học
 * (1, 2, 3...) trong mỗi ngày theo thứ tự thời gian bắt đầu tăng dần - ca
 * sớm nhất trong ngày là ca 1, kế tiếp là ca 2... Số ca không lưu trong DB
 * mà luôn tính lại từ dữ liệu hiện có, nên không bao giờ bị lệch khi thêm/
 * sửa/xoá các ca khác trong cùng ngày.
 */
export function groupSchedulesByDay(
  schedules: StudentSchedule[],
  weekDays: Date[]
): Map<string, { schedule: StudentSchedule; caNumber: number }[]> {
  const map = new Map<string, { schedule: StudentSchedule; caNumber: number }[]>();
  for (const day of weekDays) map.set(toISODateLocal(day), []);

  for (const s of schedules) {
    const start = new Date(s.startTime);
    const key = toISODateLocal(start);
    if (!map.has(key)) continue;
    map.get(key)!.push({ schedule: s, caNumber: 0 });
  }

  for (const entries of map.values()) {
    entries.sort(
      (a, b) => new Date(a.schedule.startTime).getTime() - new Date(b.schedule.startTime).getTime()
    );
    entries.forEach((e, i) => {
      e.caNumber = i + 1;
    });
  }

  return map;
}
