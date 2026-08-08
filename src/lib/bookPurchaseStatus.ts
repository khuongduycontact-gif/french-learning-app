import type { EnrollmentStatus } from "@/types";

// Map trạng thái mua sách -> nhãn hiển thị, dùng chung ở mọi nơi hiển thị
// BookCard (trang chủ, danh sách sách, chi tiết sách...). Tái dùng đúng
// enum EnrollmentStatus vì luồng thanh toán giống hệt khoá học.
export const bookPurchaseStatusMap: Record<
  EnrollmentStatus,
  { label: string; tone: "pending" | "waiting" | "confirmed" }
> = {
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "pending" },
  AWAITING_CONFIRMATION: { label: "Chờ xác nhận", tone: "waiting" },
  CONFIRMED: { label: "Đã mua", tone: "confirmed" },
};
