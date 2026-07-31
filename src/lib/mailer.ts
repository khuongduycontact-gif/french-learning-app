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
  // Thứ tự hiển thị: giờ -> thứ -> ngày tháng năm (VD "15:00, Thứ Sáu,
  // 31/07/2026"), thay vì thứ/ngày trước giờ sau như trước.
  const dateTimeLabel = `${timeLabel}, ${dateLabel}`;

  const subject = `Nhắc lịch học: ${courseTitle} lúc ${timeLabel} ngày ${dateLabel.split(", ")[1]}`;

  // 1 hàng trong "thẻ" thông tin: icon (không nền màu) bên trái + nhãn, giá
  // trị bên phải. Toàn bộ dùng font-body (Inter), đen trắng, không tô màu.
  function row(icon: string, label: string, valueHtml: string, isLast: boolean): string {
    return `
        <tr>
          <td style="padding:14px 0; ${isLast ? "" : "border-bottom:1px solid #E5E5E5;"}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:26px; font-size:16px; line-height:1; vertical-align:top;">${icon}</td>
                <td style="padding-left:8px; font-family:'Inter',Arial,sans-serif; font-weight:600; color:#000000; font-size:14px; vertical-align:top;">${label}</td>
                <td align="right" style="font-family:'Inter',Arial,sans-serif; color:#000000; font-size:14px;">${valueHtml}</td>
              </tr>
            </table>
          </td>
        </tr>`;
  }

  const rows = [
    row("📖", "Khoá học", `<span style="font-weight:700;">${escapeHtml(courseTitle)}</span>`, false),
    row("📅", "Thời gian", escapeHtml(dateTimeLabel), false),
    row("🕐", "Thời lượng", `${duration} giờ`, !note),
  ];
  if (note) {
    rows.push(row("📝", "Ghi chú", escapeHtml(note), true));
  }

  const html = `<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0; padding:0; background:#F7F3EC; font-family:'Inter',Arial,sans-serif;">
    <div style="max-width:480px; margin:0 auto; padding:28px 20px 34px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
        <tr>
          <td style="width:38px; vertical-align:middle; padding-right:8px;">
            <img src="${LOGO_URL}" width="32" height="32" alt="Français avec Céline" style="display:block; width:32px; height:32px; border-radius:9999px;" />
          </td>
          <td style="vertical-align:middle; font-family:'Inter',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#000000;">Français avec Céline</td>
        </tr>
      </table>

      <div style="font-family:'Inter',Arial,sans-serif; font-size:22px; font-weight:700; color:#000000; margin:0 0 16px;">Chào ${escapeHtml(studentName)},</div>

      <p style="font-family:'Inter',Arial,sans-serif; font-size:15px; color:#000000; margin:0 0 20px; line-height:1.6;">
        Bạn có 1 buổi học sắp diễn ra sau khoảng 8 tiếng nữa:
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E5E5; border-radius:8px;">
        <tr>
          <td style="padding:4px 18px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${rows.join("")}
            </table>
          </td>
        </tr>
      </table>

      <p style="font-family:'Inter',Arial,sans-serif; font-size:15px; color:#000000; margin:24px 0 4px;">
        Hẹn gặp bạn trong buổi học nhé!
      </p>

      <p style="font-family:'Inter',Arial,sans-serif; color:#666666; font-size:12px; margin:24px 0 0;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
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
    `- Thời gian: ${dateTimeLabel}`,
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
