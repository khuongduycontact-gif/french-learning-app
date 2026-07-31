import nodemailer from "nodemailer";
import { formatWeekdayDateVN, formatTimeVN } from "./schedule";

// Dùng URL công khai của app (thay vì đính kèm file ảnh vào mail) để mail
// nhẹ và hiển thị được trên hầu hết các trình đọc mail. Bản logo trong
// public/email/logo-email.png là bản đã thu nhỏ/nén riêng cho mail (ảnh
// logo gốc public/logo-app.png nặng ~2.5MB, không phù hợp để tải mỗi lần
// mở mail).
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://francaisavecceline.vercel.app";
const LOGO_URL = `${SITE_URL}/email/logo-email.png`;
const SQUIGGLE_URL = `${SITE_URL}/email/squiggle.png`;
const HEART_URL = `${SITE_URL}/email/heart.png`;

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

  // 1 hàng trong "thẻ" thông tin: icon tròn màu pastel bên trái + nhãn, giá
  // trị bên phải (chữ đậm thường cho "Khoá học", hoặc pill màu tím nhạt kèm
  // icon cho "Thời gian"/"Thời lượng"/"Ghi chú" - giống bố cục trong ảnh mẫu).
  function pill(innerHtml: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="background:#ECEAFB; border-radius:9999px;"><tr><td style="padding:8px 14px; font-family:'Inter',Arial,sans-serif; font-weight:700; color:#3B3465; font-size:13px; white-space:nowrap;">${innerHtml}</td></tr></table>`;
  }

  function row(icon: string, label: string, valueHtml: string, isLast: boolean): string {
    return `
        <tr>
          <td style="padding:16px 0; ${isLast ? "" : "border-bottom:1px dashed #F0D2C4;"}">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:44px;">
                  <table role="presentation" width="40" height="40" cellpadding="0" cellspacing="0" style="background:#FCE0E4; border-radius:9999px;">
                    <tr><td align="center" style="font-size:18px; line-height:40px; height:40px;">${icon}</td></tr>
                  </table>
                </td>
                <td style="padding-left:12px; font-family:'Inter',Arial,sans-serif; font-weight:700; color:#1B2A4A; font-size:14px;">${label}</td>
                <td align="right">${valueHtml}</td>
              </tr>
            </table>
          </td>
        </tr>`;
  }

  const rows = [
    row(
      "📖",
      "Khoá học",
      `<span style="font-family:'Playfair Display',Georgia,serif; font-weight:700; color:#E4485A; font-size:18px; white-space:nowrap;">${escapeHtml(courseTitle)}</span>`,
      false
    ),
    row("📅", "Thời gian", pill(`🗓️ ${dateLabel}, ${timeLabel}`), false),
    row("🕐", "Thời lượng", pill(`⏳ ${duration} giờ`), !note),
  ];
  if (note) {
    rows.push(row("📝", "Ghi chú", `<span style="font-family:'Inter',Arial,sans-serif; color:#2E3B57; font-size:14px;">${escapeHtml(note)}</span>`, true));
  }

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
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0; padding:0; background:#FBF3EC;">
    <div style="max-width:480px; margin:0 auto; padding:28px 20px 34px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
        <tr>
          <td style="width:38px; vertical-align:middle; padding-right:8px;">
            <img src="${LOGO_URL}" width="32" height="32" alt="Français avec Céline" style="display:block; width:32px; height:32px; border-radius:9999px;" />
          </td>
          <td style="vertical-align:middle; font-family:'Inter',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#C9927E;">Français avec Céline</td>
        </tr>
      </table>

      <div style="font-family:'Playfair Display',Georgia,'Times New Roman',serif; font-size:28px; font-weight:700; color:#1B2A4A;">Chào ${escapeHtml(studentName)},</div>
      <img src="${SQUIGGLE_URL}" width="90" height="16" alt="" style="display:block; margin:2px 0 20px;" />

      <p style="font-family:'Inter',Arial,sans-serif; font-size:16px; color:#2E3B57; margin:0 0 22px; line-height:1.6;">
        Bạn có <strong style="color:#E4485A;">1 buổi học</strong> sắp diễn ra sau khoảng <strong style="color:#E4485A;">8 tiếng</strong> nữa:
      </p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7EF; border:2px dashed #F1D6C7; border-radius:24px;">
        <tr>
          <td style="padding:4px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${rows.join("")}
            </table>
          </td>
        </tr>
      </table>

      <p style="font-family:'Inter',Arial,sans-serif; font-size:16px; color:#2E3B57; margin:28px 0 4px;">
        Hẹn gặp bạn trong buổi học nhé! <img src="${HEART_URL}" width="15" height="13" alt="" style="vertical-align:middle; margin-left:2px;" />
      </p>
      <img src="${SQUIGGLE_URL}" width="140" height="20" alt="" style="display:block; margin:2px 0 26px;" />

      <p style="font-family:'Inter',Arial,sans-serif; color:#B9A695; font-size:12px; margin:0;">Đây là email tự động, vui lòng không phản hồi lại email này.</p>
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
