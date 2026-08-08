export type AdminNavIconName =
  | "dashboard"
  | "enrollment"
  | "course"
  | "submission"
  | "achievement"
  | "schedule"
  | "about"
  | "book"
  | "bookPurchase"
  | "trustedWebsite";

export type AdminNavChild = {
  href: string;
  label: string;
  exact: boolean;
};

// Một mục đơn (không có nhóm con) - bấm vào là điều hướng luôn.
export type AdminNavLink = {
  type: "link";
  href: string;
  label: string;
  exact: boolean;
  icon: AdminNavIconName;
};

// Một nhóm menu (giống nhóm "Auth" trong ảnh minh hoạ) - bấm vào tiêu đề
// nhóm để mở/đóng, bên trong là danh sách các mục con (không có icon riêng).
export type AdminNavGroup = {
  type: "group";
  label: string;
  icon: AdminNavIconName;
  children: AdminNavChild[];
};

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

export const adminNavLinks: AdminNavEntry[] = [
  { type: "link", href: "/admin", label: "Tổng quan", exact: true, icon: "dashboard" },
  {
    type: "group",
    label: "Khoá học",
    icon: "course",
    children: [
      { href: "/admin/courses", label: "Khoá học", exact: false },
      { href: "/admin/enrollments", label: "Đăng ký & thanh toán", exact: false },
      { href: "/admin/submissions", label: "Bài nộp", exact: false },
      { href: "/admin/schedules", label: "Thời khoá biểu", exact: false },
    ],
  },
  {
    type: "group",
    label: "Sách",
    icon: "book",
    children: [
      { href: "/admin/books", label: "Sách", exact: false },
      { href: "/admin/book-purchases", label: "Mua sách & thanh toán", exact: false },
    ],
  },
  {
    type: "link",
    href: "/admin/trusted-websites",
    label: "Website tham khảo",
    exact: false,
    icon: "trustedWebsite",
  },
  { type: "link", href: "/admin/achievements", label: "Thành tích", exact: false, icon: "achievement" },
  { type: "link", href: "/admin/about", label: "Giới thiệu về Céline", exact: false, icon: "about" },
];

export function isAdminNavActive(
  pathname: string | null,
  href: string,
  exact: boolean
) {
  if (exact) return pathname === href;
  return pathname === href || pathname?.startsWith(`${href}/`) || false;
}

// Nhóm được coi là "đang active" nếu route hiện tại khớp với 1 trong các
// mục con của nó - dùng để tô sáng tiêu đề nhóm và tự mở nhóm khi vào trang.
export function isAdminNavGroupActive(pathname: string | null, group: AdminNavGroup) {
  return group.children.some((c) => isAdminNavActive(pathname, c.href, c.exact));
}
