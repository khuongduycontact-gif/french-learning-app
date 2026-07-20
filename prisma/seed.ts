import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const courses = [
    {
      title: "Tiếng Pháp Vỡ Lòng A1",
      slug: "tieng-phap-vo-long-a1",
      description:
        "Khoá học dành cho người mới bắt đầu: bảng chữ cái, phát âm, chào hỏi và giao tiếp cơ bản hàng ngày.",
      level: "A1" as const,
      price: 990000,
      duration: 30,
      sessions: 15,
      lessons: 24,
      imageUrl:
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
      videoUrl: null,
    },
    {
      title: "Giao Tiếp Pháp Ngữ A2",
      slug: "giao-tiep-phap-ngu-a2",
      description:
        "Mở rộng vốn từ vựng, luyện nghe nói tình huống thực tế: mua sắm, đi lại, nhà hàng.",
      level: "A2" as const,
      price: 1290000,
      duration: 36,
      sessions: 18,
      lessons: 28,
      imageUrl:
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=800",
      videoUrl: null,
    },
    {
      title: "Pháp Ngữ Trung Cấp B1",
      slug: "phap-ngu-trung-cap-b1",
      description:
        "Củng cố ngữ pháp nâng cao, luyện viết đoạn văn và thảo luận chủ đề xã hội.",
      level: "B1" as const,
      price: 1590000,
      duration: 40,
      sessions: 20,
      lessons: 32,
      imageUrl:
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
      videoUrl: null,
    },
    {
      title: "Luyện Thi DELF B2",
      slug: "luyen-thi-delf-b2",
      description:
        "Chiến lược làm bài thi DELF B2: đọc hiểu, nghe hiểu, viết luận và nói phản biện.",
      level: "B2" as const,
      price: 2190000,
      duration: 48,
      sessions: 24,
      lessons: 36,
      imageUrl:
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800",
      videoUrl: null,
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  console.log("Đã tạo dữ liệu mẫu cho", courses.length, "khoá học.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
