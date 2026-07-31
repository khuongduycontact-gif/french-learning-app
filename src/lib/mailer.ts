import nodemailer from "nodemailer";
import { formatWeekdayDateVN, formatTimeVN } from "./schedule";

// Dùng URL công khai của app (thay vì đính kèm file ảnh vào mail) để mail
// nhẹ và hiển thị được trên hầu hết các trình đọc mail. Bản logo trong
// public/email/logo-email.png là bản đã thu nhỏ/nén riêng cho mail (ảnh
// logo gốc public/logo-app.png nặng ~2.5MB, không phù hợp để tải mỗi lần
// mở mail).
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://francaisavecceline.vercel.app";
const LOGO_URL = `${SITE_URL}/email/logo-email.png`;

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

  const dateLabel = formatWeekdayDateVN(startTime);
  const timeLabel = formatTimeVN(startTime);

  const subject = `Nhắc lịch học: ${courseTitle} lúc ${timeLabel} ngày ${dateLabel.split(", ")[1]}`;

  // Playfair Display là font hiển thị (font-display) dùng cho tiêu đề khắp
  // app (VD "Thời khoá biểu", logo "Français avec Céline"). Nạp qua Google
  // Fonts để mail dùng đúng font này thay vì font serif chung chung; các
  // trình đọc mail không hỗ trợ web font sẽ tự rơi về Georgia/serif.
  const html = `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0; padding:24px 16px; background:#F7F3EC;">
    <div style="font-family:'Playfair Display', Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; color:#1B2A4A; line-height:1.6;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
        <tr>
          <td style="width:44px; vertical-align:middle; padding-right:10px;">
            <img
              src="${LOGO_URL}"
              width="40"
              height="40"
              alt="Français avec Céline"
              style="display:block; width:40px; height:40px; border-radius:9999px;"
            />
          </td>
          <td style="vertical-align:middle;">
            <p style="margin:0; font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#8C2F35;">Français avec Céline</p>
          </td>
        </tr>
      </table>
      <h1 style="margin:0 0 20px; font-size:22px; font-weight:700; color:#1B2A4A;">Nhắc lịch học</h1>
      <p>Chào ${escapeHtml(studentName)},</p>
      <p>Bạn có 1 buổi học sắp diễn ra sau khoảng 8 tiếng nữa:</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr>
          <td style="padding:6px 0; color:#8C2F35; width:120px; vertical-align:top;">Khoá học</td>
          <td style="padding:6px 0; font-weight:600;">${escapeHtml(courseTitle)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#8C2F35; vertical-align:top;">Thời gian</td>
          <td style="padding:6px 0; font-weight:600;">${dateLabel}, ${timeLabel}</td>
        </tr>
        <tr>
          <td style="padding:6px 0; color:#8C2F35; vertical-align:top;">Thời lượng</td>
          <td style="padding:6px 0;">${duration} giờ</td>
        </tr>
        ${
          note
            ? `<tr><td style="padding:6px 0; color:#8C2F35; vertical-align:top;">Ghi chú</td><td style="padding:6px 0;">${escapeHtml(note)}</td></tr>`
            : ""
        }
      </table>
      <p>Hẹn gặp bạn trong buổi học nhé!</p>
      <p style="color:#8a7a63; font-size:12px; margin-top:24px;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
    </div>
  </body>
</html>`;

  // Bản text thuần đi kèm html (multipart) - mail chỉ có HTML mà không có
  // bản text thường bị các bộ lọc thư rác (Gmail, v.v.) chấm điểm thấp hơn.
  const text = [
    "Nhắc lịch học",
    "",
    `Chào ${studentName},`,
    "",
    "Bạn có 1 buổi học sắp diễn ra sau khoảng 8 tiếng nữa:",
    `- Khoá học: ${courseTitle}`,
    `- Thời gian: ${dateLabel}, ${timeLabel}`,
    `- Thời lượng: ${duration} giờ`,
    ...(note ? [`- Ghi chú: ${note}`] : []),
    "",
    "Hẹn gặp bạn trong buổi học nhé!",
    "",
    "Đây là email tự động, vui lòng không phản hồi lại email này.",
  ].join("\n");

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: studentEmail,
    subject,
    text,
    html,
  });
}
