import AdminSidebar from "./AdminSidebar";

// Bố cục dùng chung 1 kiểu cho mọi kích thước màn hình: menu luôn nằm bên
// trái nội dung (không xếp chồng lên nhau trên mobile), tự co giãn theo
// trạng thái thu gọn/mở rộng của AdminSidebar.
export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 px-3 py-6 sm:gap-6 sm:px-6 sm:py-10 md:gap-8 md:px-10">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
