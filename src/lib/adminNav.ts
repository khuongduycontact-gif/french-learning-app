export const adminNavLinks = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/enrollments", label: "Đăng ký & thanh toán", exact: false },
  { href: "/admin/courses", label: "Khoá học", exact: false },
  { href: "/admin/schedules", label: "Thời khoá biểu", exact: false },
  { href: "/admin/submissions", label: "Bài nộp", exact: false },
  { href: "/admin/achievements", label: "Thành tích", exact: false },
  { href: "/admin/about", label: "Giới thiệu về Céline", exact: false },
];

export function isAdminNavActive(
  pathname: string | null,
  href: string,
  exact: boolean
) {
  if (exact) return pathname === href;
  return pathname === href || pathname?.startsWith(`${href}/`) || false;
}
