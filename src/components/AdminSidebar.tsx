"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/courses", label: "Khoá học", exact: false },
  { href: "/admin/enrollments", label: "Đăng ký & thanh toán", exact: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname?.startsWith(`${href}/`);
  }

  return (
    <aside className="h-fit rounded-2xl border border-mist bg-white/60 p-4">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
        Quản trị
      </p>
      <nav className="flex flex-col gap-1 text-sm">
        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`block min-w-0 truncate rounded-lg px-3 py-2 font-medium transition ${
                active ? "bg-bordeaux text-parchment" : "text-ink hover:bg-mist"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
