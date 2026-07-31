// Helper dùng chung cho tính năng "1 lớp có thể có nhiều học viên, mỗi học
// viên 1 gmail" ở thời khoá biểu: admin nhập nhiều gmail cách nhau bởi dấu
// phẩy (","), dấu chấm phẩy (";"), hoặc xuống dòng vào 1 ô duy nhất; hệ
// thống tách ra thành danh sách để validate từng gmail và gửi mail nhắc
// lịch cho toàn bộ lớp trong cùng 1 lần gửi. Lưu trong DB dưới dạng 1
// chuỗi các gmail cách nhau bởi ", " để hiển thị lại gọn gàng trên form.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tách 1 chuỗi nhập tay (nhiều gmail cách nhau bởi ",", ";" hoặc xuống dòng) thành mảng gmail đã trim, bỏ chuỗi rỗng. */
export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

/** Chuẩn hoá lại thành 1 chuỗi để lưu DB / hiển thị: các gmail cách nhau bởi ", ", đã bỏ trùng. */
export function normalizeEmailList(raw: string): string {
  const emails = parseEmailList(raw);
  const unique = Array.from(new Set(emails.map((e) => e.toLowerCase())));
  return unique.join(", ");
}

/** true nếu có ít nhất 1 gmail và TẤT CẢ gmail trong danh sách đều đúng định dạng. */
export function isValidEmailList(raw: string): boolean {
  const emails = parseEmailList(raw);
  return emails.length > 0 && emails.every((e) => EMAIL_RE.test(e));
}
