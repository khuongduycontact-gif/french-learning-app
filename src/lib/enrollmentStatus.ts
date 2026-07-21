import type { EnrollmentStatus } from "@/types";

// Map trạng thái đăng ký -> nhãn hiển thị cho học viên, dùng chung ở mọi nơi
// hiển thị CourseCard (trang chủ, danh sách khoá học, khoá học của tôi...)
export const enrollmentStatusMap: Record<
  EnrollmentStatus,
  { label: string; tone: "pending" | "waiting" | "confirmed" }
> = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "pending" },
  AWAITING_CONFIRMATION: { label: "Chờ xác nhận", tone: "waiting" },
  CONFIRMED: { label: "Đã đăng ký", tone: "confirmed" },
};
