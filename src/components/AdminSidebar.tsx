"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  adminNavLinks,
  isAdminNavActive,
  isAdminNavGroupActive,
  type AdminNavEntry,
} from "@/lib/adminNav";
import AdminNavIcon from "./AdminNavIcons";
import { useAdminDrawer } from "./AdminDrawerContext";

const STORAGE_KEY = "admin-sidebar-collapsed";

function ChevronIcon({ className }: { className?: string }) {
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
      <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
    </svg>
  );
}

// Icon dùng chung cho 1 mục (link đơn hoặc tiêu đề nhóm) - tách ra để
// dùng lại cho cả link thường, tiêu đề nhóm và danh sách rút gọn (icon-only).
function NavItemLink({
  href,
  label,
  icon,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: Parameters<typeof AdminNavIcon>[0]["name"];
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
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
        name={icon}
        className={`h-5 w-5 shrink-0 transition-colors ${
          active ? "text-bordeaux" : "text-ink/50 group-hover:text-ink"
        }`}
      />
      {!collapsed && <span className="min-w-0 truncate">{label}</span>}
    </Link>
  );
}

function NavList({
  collapsed,
  onNavigate,
  onGroupClickWhileCollapsed,
  forceOpenGroup,
  onForceOpenGroupHandled,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  // Được gọi khi bấm vào một nhóm lúc sidebar đang thu gọn: cha sẽ tự mở
  // rộng sidebar ra để người dùng chọn mục con bên trong nhóm đó.
  onGroupClickWhileCollapsed?: (label: string) => void;
  // Nhãn nhóm cần tự mở ngay sau khi sidebar vừa được mở rộng từ trạng
  // thái thu gọn (do bấm vào nhóm lúc đang collapsed).
  forceOpenGroup?: string | null;
  onForceOpenGroupHandled?: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Tự động mở nhóm đang chứa route hiện tại, để người dùng luôn thấy mục
  // đang active mà không phải tự bấm mở nhóm.
  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      adminNavLinks.forEach((entry) => {
        if (entry.type === "group" && isAdminNavGroupActive(pathname, entry)) {
          next[entry.label] = true;
        }
      });
      return next;
    });
  }, [pathname]);

  // Khi cha báo có nhóm cần mở ngay (vừa mở rộng sidebar từ lúc thu gọn),
  // mở nhóm đó ra rồi báo lại cho cha là đã xử lý xong.
  useEffect(() => {
    if (!forceOpenGroup) return;
    setOpenGroups((prev) => ({ ...prev, [forceOpenGroup]: true }));
    onForceOpenGroupHandled?.();
  }, [forceOpenGroup, onForceOpenGroupHandled]);

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  // Sidebar thu gọn (chỉ hiện icon): mục đơn bấm vào là chuyển trang luôn;
  // còn nhóm thì bấm vào sẽ tự mở rộng sidebar ra để chọn mục con, vì
  // dạng thu gọn không đủ chỗ hiện danh sách con để chọn trực tiếp.
  if (collapsed) {
    return (
      <nav className="flex flex-col gap-1 text-sm">
        {adminNavLinks.map((entry: AdminNavEntry) => {
          if (entry.type === "link") {
            return (
              <NavItemLink
                key={entry.href}
                href={entry.href}
                label={entry.label}
                icon={entry.icon}
                active={isAdminNavActive(pathname, entry.href, entry.exact)}
                collapsed
                onNavigate={onNavigate}
              />
            );
          }

          const groupActive = isAdminNavGroupActive(pathname, entry);
          return (
            <button
              key={entry.label}
              type="button"
              title={entry.label}
              aria-label={entry.label}
              onClick={() => onGroupClickWhileCollapsed?.(entry.label)}
              className={`group relative flex min-w-0 items-center justify-center rounded-xl px-3 py-2.5 font-medium transition-colors ${
                groupActive
                  ? "bg-gradient-to-r from-ink/10 via-white/80 to-bordeaux/10 text-ink ring-1 ring-inset ring-mist/70 shadow-sm"
                  : "text-ink/80 hover:bg-mist/70 hover:text-ink"
              }`}
            >
              <AdminNavIcon
                name={entry.icon}
                className={`h-5 w-5 shrink-0 transition-colors ${
                  groupActive ? "text-bordeaux" : "text-ink/50 group-hover:text-ink"
                }`}
              />
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 text-sm">
      {adminNavLinks.map((entry: AdminNavEntry) => {
        if (entry.type === "link") {
          return (
            <NavItemLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              icon={entry.icon}
              active={isAdminNavActive(pathname, entry.href, entry.exact)}
              collapsed={false}
              onNavigate={onNavigate}
            />
          );
        }

        // Nhóm menu (giống nhóm "Auth" trong ảnh minh hoạ): tiêu đề có
        // icon + chevron, bấm vào để mở/đóng danh sách mục con bên dưới.
        const groupActive = isAdminNavGroupActive(pathname, entry);
        const isOpen = !!openGroups[entry.label];

        return (
          <div key={entry.label} className="flex flex-col">
            <button
              type="button"
              onClick={() => toggleGroup(entry.label)}
              aria-expanded={isOpen}
              className={`group flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition-colors ${
                groupActive
                  ? "text-ink"
                  : "text-ink/80 hover:bg-mist/70 hover:text-ink"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <AdminNavIcon
                  name={entry.icon}
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    groupActive ? "text-bordeaux" : "text-ink/50 group-hover:text-ink"
                  }`}
                />
                <span className="min-w-0 truncate">{entry.label}</span>
              </span>
              <ChevronIcon
                className={`h-4 w-4 shrink-0 text-ink/40 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="ml-[1.15rem] flex flex-col gap-0.5 border-l border-mist py-1 pl-4">
                  {entry.children.map((child) => {
                    const active = isAdminNavActive(pathname, child.href, child.exact);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavigate}
                        className={`min-w-0 truncate rounded-lg px-3 py-2 transition-colors ${
                          active
                            ? "font-semibold text-bordeaux"
                            : "text-ink/70 hover:bg-mist/70 hover:text-ink"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
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
  // Nhóm đang chờ được mở ra ngay sau khi sidebar vừa mở rộng (do bấm vào
  // icon nhóm lúc đang thu gọn).
  const [pendingOpenGroup, setPendingOpenGroup] = useState<string | null>(null);

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

  // Bấm vào một nhóm lúc sidebar đang thu gọn: tự động mở rộng sidebar ra
  // và mở sẵn nhóm đó để người dùng chọn mục con, thay vì phải bấm 2 lần.
  const expandForGroup = (label: string) => {
    setCollapsed(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "0");
    } catch {
      // bỏ qua nếu localStorage bị chặn
    }
    setPendingOpenGroup(label);
  };

  return (
    <aside
      className={`sticky top-24 z-30 flex h-fit shrink-0 transform-gpu flex-col rounded-2xl border border-mist bg-white/60 p-3 shadow-sm transition-[width] duration-300 ease-out ${
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

      <NavList
        collapsed={collapsed}
        onGroupClickWhileCollapsed={expandForGroup}
        forceOpenGroup={pendingOpenGroup}
        onForceOpenGroupHandled={() => setPendingOpenGroup(null)}
      />
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
