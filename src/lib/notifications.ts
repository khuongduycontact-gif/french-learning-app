import { prisma } from "./prisma";

// Gửi thông báo cho tất cả admin (dùng khi học viên báo đã thanh toán, hoặc
// khi học viên vừa nộp bài tập)
export async function notifyAdmins({
  type = "PAYMENT_SUBMITTED",
  title,
  message,
  link,
}: {
  type?: "PAYMENT_SUBMITTED" | "SUBMISSION_RECEIVED";
  title: string;
  message: string;
  link?: string;
}) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((a) => ({
      userId: a.id,
      type,
      title,
      message,
      link,
    })),
  });
}

// Gửi thông báo cho một học viên cụ thể (khi admin xác nhận/từ chối thanh
// toán, hoặc khi admin đã chữa xong bài tập)
export async function notifyUser({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: "ENROLLMENT_CONFIRMED" | "PAYMENT_REJECTED" | "SUBMISSION_GRADED";
  title: string;
  message: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}
