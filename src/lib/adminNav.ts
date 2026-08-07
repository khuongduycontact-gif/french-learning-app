export type AdminNavIconName =
  | "dashboard"
  | "enrollment"
  | "course"
  | "submission"
  | "achievement"
  | "schedule"
  | "about";

export const adminNavLinks: {
  href: string;
  label: string;
  exact: boolean;
  icon: AdminNavIconName;
}[] = [
  { href: "/admin", label: "Tổng quan", exact: true, icon: "dashboard" },
  {
    href: "/admin/enrollments",
    label: "Đăng ký & thanh toán",
    exact: false,
    icon: "enrollment",
  },
  { href: "/admin/courses", label: "Khoá học", exact: false, icon: "course" },
  { href: "/admin/submissions", label: "Bài nộp", exact: false, icon: "submission" },
  { href: "/admin/achievements", label: "Thành tích", exact: false, icon: "achievement" },
  { href: "/admin/schedules", label: "Thời khoá biểu", exact: false, icon: "schedule" },
  { href: "/admin/about", label: "Giới thiệu về Céline", exact: false, icon: "about" },
];

export function isAdminNavActive(
  pathname: string | null,
  href: string,
  exact: boolean
) {
  if (exact) return pathname === href;
  return pathname === href || pathname?.startsWith(`${href}/`) || false;
}
