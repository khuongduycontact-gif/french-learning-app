import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { defaultAboutContent } from "@/lib/aboutDefaults";
import type { AboutPage } from "@/types";

// Luôn có đúng 1 bản ghi với id cố định "main". Lần đầu truy cập (chưa có
// bản ghi nào) sẽ tự tạo với nội dung mặc định để trang không bị trống,
// admin có thể sửa lại toàn bộ sau đó.
export async function getAboutPage(): Promise<AboutPage> {
  const record = await prisma.aboutPage.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      ...defaultAboutContent,
      // Các mảng mặc định có kiểu cụ thể (AboutTimelineItem[]...) nên TS
      // không tự suy ra được là hợp lệ với cột Json của Prisma - ép kiểu
      // tường minh sang Prisma.InputJsonValue để khớp đúng input type.
      timeline: defaultAboutContent.timeline as unknown as Prisma.InputJsonValue,
      reasons: defaultAboutContent.reasons as unknown as Prisma.InputJsonValue,
      methods: defaultAboutContent.methods as unknown as Prisma.InputJsonValue,
    },
  });

  return serializeAboutPage(record);
}

// Các cột Json trong Prisma trả về kiểu `unknown` - ép kiểu về mảng, phòng
// trường hợp dữ liệu cũ/lỗi thì trả về mảng rỗng thay vì crash trang.
function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function serializeAboutPage(record: any): AboutPage {
  return {
    id: record.id,
    heroKicker: record.heroKicker,
    heroTitle: record.heroTitle,
    heroGreeting: record.heroGreeting,
    heroDescription: record.heroDescription,
    heroImageUrl: record.heroImageUrl,
    heroBadgeUrl: record.heroBadgeUrl,
    timeline: toArray(record.timeline),
    reasons: toArray(record.reasons),
    methodTitle: record.methodTitle,
    methodImageUrl: record.methodImageUrl,
    methods: toArray(record.methods),
    updatedAt:
      record.updatedAt instanceof Date
        ? record.updatedAt.toISOString()
        : record.updatedAt,
  };
}
