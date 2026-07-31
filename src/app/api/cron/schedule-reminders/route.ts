import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureRecurringSchedulesMaterialized } from "@/lib/recurringSchedule";
import { sendClassReminderEmail } from "@/lib/mailer";

// Số tiếng trước giờ học sẽ gửi mail nhắc (mặc định 8, có thể chỉnh qua env
// SCHEDULE_REMINDER_HOURS nếu cần).
const REMINDER_HOURS = Number(process.env.SCHEDULE_REMINDER_HOURS) || 8;

// Giới hạn số mail gửi tối đa trong 1 lần chạy, để tránh function bị Vercel
// timeout giữa chừng nếu có rất nhiều buổi học đến hạn nhắc cùng lúc (VD
// cron bị tắt một thời gian dài rồi bật lại). Buổi nào chưa kịp gửi trong
// lần này vẫn còn reminderSentAt = NULL nên sẽ tự được xử lý ở lần chạy kế
// tiếp (15-30 phút sau), miễn buổi học đó chưa diễn ra.
const MAX_EMAILS_PER_RUN = 50;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Endpoint này KHÔNG dùng session đăng nhập (vì được gọi tự động bởi
// cron/scheduler bên ngoài, không phải người dùng) - xác thực bằng
// CRON_SECRET thay thế. Chấp nhận secret qua header
// "Authorization: Bearer <secret>" (cách Vercel Cron tự gửi) hoặc qua query
// "?secret=..." (để dùng được với các dịch vụ cron ngoài như cron-job.org).
// So sánh secret bằng hàm timing-safe để tránh bị dò secret qua thời gian
// phản hồi (timing attack).
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const provided =
    authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : new URL(req.url).searchParams.get("secret");

  if (!provided) return false;
  return timingSafeEqual(provided, secret);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// GET /api/cron/schedule-reminders
// 1. Sinh sẵn thêm buổi học cho các lịch lặp hàng tuần đang hoạt động (đề
//    phòng chưa ai mở trang thời khoá biểu gần đây).
// 2. Tìm các buổi học sắp diễn ra trong vòng REMINDER_HOURS tiếng tới mà
//    chưa gửi mail nhắc (reminderSentAt = NULL).
// 3. Với mỗi buổi: "claim" trước bằng 1 update có điều kiện
//    (reminderSentAt: null -> now) - nếu update trả về 0 dòng nghĩa là 1
//    lần chạy khác (chồng lịch) đã claim mất rồi, bỏ qua để không gửi
//    trùng. Nếu claim thành công mới gửi mail; nếu gửi thất bại thì revert
//    lại reminderSentAt = null để lần chạy sau tự động thử lại.
//
// LƯU Ý QUAN TRỌNG VỀ TẦN SUẤT CHẠY: Vercel Cron trên gói Hobby (miễn phí)
// chỉ chạy được tối đa 1 lần/ngày và không đảm bảo đúng giờ, nên không đủ
// để nhắc "trước đúng 8 tiếng". Nên dùng 1 dịch vụ cron ngoài miễn phí (VD
// cron-job.org) gọi GET tới URL này mỗi 15-30 phút kèm ?secret=..., xem
// hướng dẫn trong README.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 401 });
  }

  try {
    await ensureRecurringSchedulesMaterialized();
  } catch (err) {
    // Nếu bước sinh lịch lặp lỗi (VD DB tạm gián đoạn), vẫn tiếp tục gửi
    // nhắc cho các buổi đã có sẵn trong DB thay vì fail toàn bộ request.
    console.error("[schedule-reminders] Lỗi khi sinh lịch lặp:", err);
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_HOURS * 60 * 60 * 1000);

  const dueSchedules = await prisma.studentSchedule.findMany({
    where: {
      reminderSentAt: null,
      startTime: { gt: now, lte: windowEnd },
    },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { startTime: "asc" },
    take: MAX_EMAILS_PER_RUN,
  });

  let sent = 0;
  let failed = 0;
  let skippedInvalidEmail = 0;

  for (const schedule of dueSchedules) {
    // Bỏ qua sớm nếu địa chỉ mail không đúng định dạng, tránh gọi Nodemailer
    // với input chắc chắn lỗi (nếu admin nhập sai email lúc tạo lịch, dữ
    // liệu vẫn giữ nguyên reminderSentAt = null để có thể sửa email rồi
    // được gửi lại ở lần chạy sau, thay vì bị đánh dấu "đã gửi" nhầm).
    if (!EMAIL_REGEX.test(schedule.studentEmail)) {
      console.error(
        `[schedule-reminders] Bỏ qua buổi ${schedule.id}: email không hợp lệ ("${schedule.studentEmail}")`
      );
      skippedInvalidEmail++;
      continue;
    }

    // Claim trước khi gửi: chỉ update nếu vẫn còn NULL (chưa bị lần chạy
    // chồng lịch nào khác claim mất). count === 0 nghĩa là đã bị claim rồi.
    const claim = await prisma.studentSchedule.updateMany({
      where: { id: schedule.id, reminderSentAt: null },
      data: { reminderSentAt: now },
    });
    if (claim.count === 0) continue;

    try {
      await sendClassReminderEmail({
        studentName: schedule.studentName,
        studentEmail: schedule.studentEmail,
        courseTitle: schedule.course?.title || "khoá học",
        startTime: schedule.startTime,
        duration: schedule.duration,
        note: schedule.note,
      });
      sent++;
    } catch (err) {
      console.error(`[schedule-reminders] Gửi mail thất bại cho buổi ${schedule.id}:`, err);
      failed++;
      // Gửi thất bại (VD Gmail tạm lỗi) -> revert lại NULL để lần chạy sau
      // (15-30 phút tới) tự động thử gửi lại, tránh mất luôn thông báo.
      await prisma.studentSchedule.update({
        where: { id: schedule.id },
        data: { reminderSentAt: null },
      });
    }
  }

  return NextResponse.json({
    checked: dueSchedules.length,
    sent,
    failed,
    skippedInvalidEmail,
    reachedBatchLimit: dueSchedules.length === MAX_EMAILS_PER_RUN,
  });
}
