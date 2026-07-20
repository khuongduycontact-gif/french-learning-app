"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Notification } from "@/types";

const POLL_INTERVAL_MS = 20000;

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // bỏ qua lỗi mạng khi polling nền
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session?.user, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
    } catch {
      // đồng bộ lại ở lần poll kế tiếp nếu lỗi
    }
  }

  async function handleNotificationClick(n: Notification) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      fetch(`/api/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
    }
    if (n.link) router.push(n.link);
  }

  if (!session?.user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Thông báo"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-mist bg-white text-ink/70 transition hover:bg-mist/60"
      >
        <svg
          className="h-[18px] w-[18px]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 8.5C18 6.9 17.4 5.4 16.2 4.3C15.1 3.2 13.6 2.6 12 2.6C10.4 2.6 8.9 3.2 7.8 4.3C6.6 5.4 6 6.9 6 8.5C6 15 3.5 16.8 3.5 16.8H20.5C20.5 16.8 18 15 18 8.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.9 20.4C13.6 20.9 13 21.3 12.3 21.4C11.6 21.5 10.9 21.3 10.4 20.9C10.1 20.7 9.9 20.6 9.8 20.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bordeaux px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-mist bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-mist px-4 py-3">
            <p className="text-sm font-semibold text-ink">Thông báo</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-bordeaux hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-ink/50">
                Đang tải...
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink/50">
                Không có thông báo nào.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex w-full flex-col gap-0.5 border-b border-mist px-4 py-3 text-left transition last:border-0 hover:bg-mist/50 ${
                    !n.read ? "bg-bordeaux/5" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {!n.read && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-bordeaux" />
                    )}
                    {n.title}
                  </span>
                  <span className="line-clamp-2 text-xs text-ink/60">
                    {n.message}
                  </span>
                  <span className="mt-0.5 text-[11px] text-ink/40">
                    {timeAgo(n.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
