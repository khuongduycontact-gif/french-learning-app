"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks, isAdminNavActive } from "@/lib/adminNav";
import AdminNavIcon from "./AdminNavIcons";
import { useAdminDrawer } from "./AdminDrawerContext";

const STORAGE_KEY = "admin-sidebar-collapsed";

function NavList({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {adminNavLinks.map((link) => {
        const active = isAdminNavActive(pathname, link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            title={collapsed ? link.label : undefined}
            onClick={onNavigate}
            className={`group relative flex min-w-0 items-center rounded-xl px-3 py-2.5 font-medium transition-colors ${
              collapsed ? "justify-center gap-0" : "justify-start gap-3"
            } ${
              active
                ? "bg-gradient-to-r from-ink/10 via-white/80 to-bordeaux/10 text-ink ring-1 ring-inset ring-mist/70 shadow-sm"
                : "text-ink/80 hover:bg-mist/70 hover:text-ink"
            }`}
          >
            <AdminNavIcon
              name={link.icon}
              className={`h-5 w-5 shrink-0 transition-colors ${
                active ? "text-bordeaux" : "text-ink/50 group-hover:text-ink"
              }`}
            />
            {!collapsed && (
              <span className="min-w-0 truncate">{link.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}

// Sidebar cố định cho desktop/tablet ngang (>= lg, 1024px): có thể thu
// gọn về dạng icon hoặc mở rộng đầy đủ, lựa chọn được ghi nhớ lại.
function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setCollapsed(false);
    }
    setReady(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage có thể bị chặn (chế độ ẩn danh nghiêm ngặt...) - bỏ qua.
      }
      return next;
    });
  };

  return (
    <aside
      className={`sticky top-24 z-30 flex h-fit shrink-0 flex-col rounded-2xl border border-mist bg-white/60 p-3 shadow-sm transition-[width] duration-300 ease-out ${
        collapsed ? "w-[76px]" : "w-64"
      } ${ready ? "" : "invisible"}`}
    >
      <div
        className={`mb-2 flex items-center gap-2 px-1 pb-1 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-ink/50">
            Quản trị
          </p>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Mở rộng menu quản trị" : "Thu gọn menu quản trị"}
          aria-pressed={collapsed}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/40 transition hover:text-ink"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      <NavList collapsed={collapsed} />
    </aside>
  );
}

// Drawer trượt cho tablet dọc/mobile (< lg, 1024px): ẩn mặc định, mở bằng
// nút menu trên AdminHeader, không chiếm chỗ của phần nội dung.
function DrawerSidebar() {
  const { drawerOpen, closeDrawer } = useAdminDrawer();

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-[1px] transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu quản trị"
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[82vw] flex-col overflow-y-auto border-r border-mist bg-parchment p-4 shadow-xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex items-center justify-between px-1 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
            Quản trị
          </p>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Đóng menu quản trị"
            className="flex h-8 w-8 shrink-0 items-center justify-center text-ink/40 transition hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <NavList collapsed={false} onNavigate={closeDrawer} />
      </aside>
    </>
  );
}

export default function AdminSidebar() {
  const { isDrawerMode, ready } = useAdminDrawer();

  if (!ready) return <div className="hidden w-64 shrink-0 lg:block" />;

  return isDrawerMode ? <DrawerSidebar /> : <DesktopSidebar />;
}
