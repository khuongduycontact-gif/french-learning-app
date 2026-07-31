import nodemailer from "nodemailer";
import { formatWeekdayDateVN, formatTimeVN } from "./schedule";
import { parseEmailList } from "./emailList";

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
  className: string;
  /** Danh sách gmail của các học viên trong lớp, cách nhau bởi dấu phẩy/chấm phẩy/xuống dòng. */
  studentEmails: string;
  startTime: Date;
  duration: number;
  note?: string | null;
}): Promise<void> {
  if (!transporter) {
    throw new Error(
      "Chưa cấu hình GMAIL_USER / GMAIL_APP_PASSWORD, không thể gửi mail nhắc lịch."
    );
  }

  const { className, studentEmails, startTime, duration, note } = params;
  // 1 lớp có thể có nhiều học viên, mỗi học viên 1 gmail -> gửi cùng 1 mail
  // nhắc lịch cho toàn bộ danh sách gmail trong lớp, trong đúng 1 lần gửi.
  const recipients = parseEmailList(studentEmails || "");
  if (recipients.length === 0) {
    throw new Error("Thiếu địa chỉ email người nhận, không thể gửi mail nhắc lịch.");
  }

  const dateLabel = formatWeekdayDateVN(startTime);
  const timeLabel = formatTimeVN(startTime);
  // Thứ tự hiển thị: giờ -> thứ -> ngày tháng năm (VD "15:00, Thứ Sáu,
  // 31/07/2026"), thay vì thứ/ngày trước giờ sau như trước.
  const dateTimeLabel = `${timeLabel}, ${dateLabel}`;

  const subject = `Nhắc lịch học: ${className} lúc ${timeLabel} ngày ${dateLabel.split(", ")[1]}`;

  // 1 hàng trong "thẻ" thông tin: icon (không nền màu) bên trái + nhãn và
  // giá trị nằm NGAY CẠNH NHAU (chỉ cách nhau 1 khoảng trắng, không đẩy giá
  // trị sang lề phải), tự động xuống dòng nếu nội dung dài thay vì tràn ra
  // ngoài. Toàn bộ dùng font-body (Inter), đen trắng, không tô màu.
  function row(icon: string, label: string, valueHtml: string, isLast: boolean): string {
    return `
        <tr>
          <td style="padding:14px 0; ${isLast ? "" : "border-bottom:1px solid #E5E5E5;"}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:26px; font-size:16px; line-height:1.5; vertical-align:top;">${icon}</td>
                <td style="font-family:'Inter',Arial,sans-serif; font-size:14px; color:#000000; line-height:1.5; word-break:break-word;">
                  <span style="font-weight:600;">${label}: </span>${valueHtml}
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
  }

  const rows = [
    row("📖", "Cours", `<span style="font-weight:700;">${escapeHtml(className)}</span>`, false),
    row("📅", "Horaire", escapeHtml(dateTimeLabel), false),
    row("🕐", "Durée", `${duration} giờ`, !note),
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
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0; padding:0; background:#F7F3EC; font-family:'Inter',Arial,sans-serif;">
    <div style="max-width:480px; margin:0 auto; padding:28px 20px 34px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
        <tr>
          <td style="font-family:'Playfair Display',Georgia,serif; font-size:19px; font-weight:600; color:#1B2A4A;">Français<span style="font-style:italic; color:#8C2F35;"> avec Céline</span></td>
        </tr>
      </table>

      <div style="font-family:'Inter',Arial,sans-serif; font-size:22px; font-weight:700; color:#000000; margin:0 0 16px;">Bonjour,</div>

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
        À toute à l’heure!
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
    "Bonjour,",
    "",
    "Bạn có 1 buổi học sắp diễn ra sau khoảng 8 tiếng nữa:",
    `- Cours: ${className}`,
    `- Horaire: ${dateTimeLabel}`,
    `- Durée: ${duration} giờ`,
    ...(note ? [`- Ghi chú: ${note}`] : []),
    "",
    "À toute à l’heure!",
    "",
    "Đây là email tự động, vui lòng không phản hồi lại email này.",
  ].join("\n");

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: recipients.join(", "),
    subject,
    text,
    html,
  });
}
