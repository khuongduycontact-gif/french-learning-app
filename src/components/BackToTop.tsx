"use client";

import { useEffect, useState } from "react";

// Nút "Về đầu trang" nổi, chỉ hiện sau khi cuộn xuống một đoạn,
// và chỉ hiện trên màn hình rộng từ 1200px trở lên (ẩn hẳn trên
// tablet/mobile để tránh che nội dung ở màn nhỏ).
// Vị trí được tính từ các biến CSS --fab-* (định nghĩa trong globals.css)
// để luôn nằm đúng phía trên nút từ điển (DictionaryLookup) 16px,
// đồng bộ trên cả desktop và mobile.
const SHOW_AFTER_PX = 320;
const MIN_WIDTH_PX = 1200;

function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    function onResize() {
      setWideEnough(window.innerWidth >= MIN_WIDTH_PX);
    }
    onScroll();
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!wideEnough) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Về đầu trang"
      title="Về đầu trang"
      className={`fixed right-5 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-ink text-parchment shadow-lg transition duration-200 hover:bg-ink/90 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{
        bottom: "calc(var(--fab-offset) + var(--fab-size) + var(--fab-gap))",
      }}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M10 15.5V4.5M10 4.5 5 9.5M10 4.5l5 5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default BackToTop;
