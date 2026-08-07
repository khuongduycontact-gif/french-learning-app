import AdminSidebar from "./AdminSidebar";

// Bố cục dùng chung: từ "lg" trở lên, menu là sidebar cố định nằm bên trái
// nội dung (có thể thu gọn/mở rộng). Dưới "lg" (tablet dọc/mobile), menu
// chuyển thành drawer trượt (ẩn mặc định) nên không chiếm chỗ - nội dung
// được dùng toàn bộ chiều ngang còn lại.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-3 py-6 sm:gap-6 sm:px-6 sm:py-10 md:gap-8 md:px-10">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
