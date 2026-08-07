"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Dưới breakpoint "lg" (1024px) của Tailwind: tablet + mobile dùng drawer
// (menu trượt, ẩn mặc định) để dành toàn bộ chiều ngang cho nội dung.
// Từ "lg" trở lên: dùng sidebar cố định như cũ (có thể thu gọn/mở rộng).
const DRAWER_QUERY = "(max-width: 1023px)";

type AdminDrawerContextValue = {
  isDrawerMode: boolean;
  drawerOpen: boolean;
  ready: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const AdminDrawerContext = createContext<AdminDrawerContextValue | null>(null);

export function AdminDrawerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDrawerMode, setIsDrawerMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DRAWER_QUERY);

    const applyState = (matches: boolean) => {
      setIsDrawerMode(matches);
      if (!matches) setDrawerOpen(false);
    };

    applyState(mql.matches);
    setReady(true);

    const handleChange = (e: MediaQueryListEvent) => applyState(e.matches);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // Tự đóng drawer mỗi khi chuyển trang.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Khoá cuộn trang nền khi drawer đang mở trên tablet/mobile.
  useEffect(() => {
    if (!isDrawerMode || !drawerOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isDrawerMode, drawerOpen]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  return (
    <AdminDrawerContext.Provider
      value={{ isDrawerMode, drawerOpen, ready, openDrawer, closeDrawer, toggleDrawer }}
    >
      {children}
    </AdminDrawerContext.Provider>
  );
}

export function useAdminDrawer() {
  const ctx = useContext(AdminDrawerContext);
  if (!ctx) {
    throw new Error("useAdminDrawer phải được dùng bên trong AdminDrawerProvider");
  }
  return ctx;
}
