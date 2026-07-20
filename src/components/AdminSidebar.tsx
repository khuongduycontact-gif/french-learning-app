"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks, isAdminNavActive } from "@/lib/adminNav";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-fit rounded-2xl border border-mist bg-white/60 p-4 md:block">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
        Quản trị
      </p>
      <nav className="flex flex-col gap-1 text-sm">
        {adminNavLinks.map((link) => {
          const active = isAdminNavActive(pathname, link.href, link.exact);
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
