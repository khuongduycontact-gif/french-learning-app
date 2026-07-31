import { prisma } from "./prisma";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

// Luôn đảm bảo đã sinh sẵn buổi học cụ thể trong X ngày tới cho mọi lịch
// lặp đang hoạt động, kể cả khi chưa có ai mở trang thời khoá biểu (cron
// nhắc lịch dựa vào các buổi cụ thể này để biết buổi nào sắp diễn ra).
const DEFAULT_HORIZON_DAYS = 60;

// Chặn sinh quá xa trong tương lai nếu có ai đó cố tình yêu cầu xem 1 tuần
// rất xa (tránh tạo hàng loạt bản ghi không cần thiết trong DB).
const MAX_HORIZON_DAYS = 365 * 3;

/**
 * Sinh thêm các buổi học cụ thể (StudentSchedule) cho tất cả lịch lặp đang
 * hoạt động (active = true, chưa hết hạn), đảm bảo đã có sẵn buổi học tới
 * hết mốc `until` (mặc định 60 ngày tới nếu không truyền). Hàm này an toàn
 * khi gọi nhiều lần liên tiếp (idempotent) nhờ unique constraint
 * [recurringId, startTime] và con trỏ `generatedUntil` lưu trên từng rule -
 * không bao giờ tạo trùng hoặc tạo lại buổi đã bị admin xoá thủ công.
 */
export async function ensureRecurringSchedulesMaterialized(until?: Date): Promise<void> {
  const now = new Date();
  const defaultHorizon = new Date(now.getTime() + DEFAULT_HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const maxAllowed = new Date(now.getTime() + MAX_HORIZON_DAYS * 24 * 60 * 60 * 1000);

  let target = until && until > defaultHorizon ? until : defaultHorizon;
  if (target > maxAllowed) target = maxAllowed;

  const rules = await prisma.recurringSchedule.findMany({
    where: {
      active: true,
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
  });

  for (const rule of rules) {
    const toGenerate: Date[] = [];
    let next = new Date(rule.generatedUntil.getTime() + MS_PER_WEEK);
    while (next <= target && (!rule.endDate || next <= rule.endDate)) {
      toGenerate.push(next);
      next = new Date(next.getTime() + MS_PER_WEEK);
    }
    if (toGenerate.length === 0) continue;

    await prisma.studentSchedule.createMany({
      data: toGenerate.map((startTime) => ({
        className: rule.className,
        studentEmails: rule.studentEmails,
        startTime,
        duration: rule.duration,
        note: rule.note,
        recurringId: rule.id,
      })),
      skipDuplicates: true,
    });

    await prisma.recurringSchedule.update({
      where: { id: rule.id },
      data: { generatedUntil: toGenerate[toGenerate.length - 1] },
    });
  }
}
