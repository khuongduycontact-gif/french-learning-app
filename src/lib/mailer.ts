import nodemailer from "nodemailer";
import { formatWeekdayDate, formatTime } from "./schedule";

// Gửi mail qua Gmail SMTP bằng App Password (không dùng mật khẩu Gmail
// thật). Xem hướng dẫn lấy App Password trong README.
// Chỉ khởi tạo transporter khi đã có đủ cấu hình - tránh crash lúc
// build/dev nếu chưa cấu hình .env (tính năng gửi mail nhắc lịch sẽ tự báo
// lỗi rõ ràng khi thật sự được gọi mà thiếu cấu hình, thay vì lỗi ngay lúc
// import).
const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
        // Timeout ngắn để tránh 1 request treo quá lâu nếu Gmail phản hồi
        // chậm/không phản hồi (endpoint cron chạy trong giới hạn thời gian
        // của Vercel function, không nên để 1 mail lỗi kéo dài cả request).
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      })
    : null;

const FROM_EMAIL = process.env.GMAIL_FROM_NAME
  ? `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_USER}>`
  : process.env.GMAIL_USER;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendClassReminderEmail(params: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  startTime: Date;
  duration: number;
  note?: string | null;
}): Promise<void> {
  if (!transporter) {
    throw new Error(
      "Chưa cấu hình GMAIL_USER / GMAIL_APP_PASSWORD, không thể gửi mail nhắc lịch."
    );
  }

  const { studentName, studentEmail, courseTitle, startTime, duration, note } = params;
  if (!studentEmail || !studentEmail.trim()) {
    throw new Error("Thiếu địa chỉ email người nhận, không thể gửi mail nhắc lịch.");
  }

  const dateLabel = formatWeekdayDate(startTime);
  const timeLabel = formatTime(startTime);

  const subject = `Nhắc lịch học: ${courseTitle} lúc ${timeLabel} ngày ${dateLabel.split(", ")[1]}`;

  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color:#2b2320; line-height:1.6;">
      <p>Chào ${escapeHtml(studentName)},</p>
      <p>Bạn có 1 buổi học sắp diễn ra sau khoảng 8 tiếng nữa:</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr>
          <td style="padding:6px 0; color:#8a7a63; width:120px; vertical-align:top;">Khoá học</td>
          <td style="padding:6px 0; font-weight:600;">${escapeHtml(courseTitle)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#8a7a63; vertical-align:top;">Thời gian</td>
          <td style="padding:6px 0; font-weight:600;">${dateLabel}, ${timeLabel}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#8a7a63; vertical-align:top;">Thời lượng</td>
          <td style="padding:6px 0;">${duration} giờ</td>
        </tr>
        ${
          note
            ? `<tr><td style="padding:6px 0; color:#8a7a63; vertical-align:top;">Ghi chú</td><td style="padding:6px 0;">${escapeHtml(note)}</td></tr>`
            : ""
        }
      </table>
      <p>Hẹn gặp bạn trong buổi học nhé!</p>
      <p style="color:#8a7a63; font-size:12px; margin-top:24px;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
    </div>
  `;

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: studentEmail,
    subject,
    html,
  });
}
