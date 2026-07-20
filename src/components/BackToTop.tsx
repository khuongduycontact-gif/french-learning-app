"use client";

import { useEffect, useState } from "react";

// Nút "Về đầu trang" nổi, chỉ hiện sau khi cuộn xuống một đoạn.
// Vị trí được tính từ các biến CSS --fab-* (định nghĩa trong globals.css)
// để luôn nằm đúng phía trên nút từ điển (DictionaryLookup) 16px,
// đồng bộ trên cả desktop và mobile.
const SHOW_AFTER_PX = 1200;

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Về đầu trang"
      title="Về đầu trang"
      className={`fixed right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-parchment shadow-lg transition duration-200 hover:bg-ink/90 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={{
        bottom: "calc(var(--fab-offset) + var(--fab-size) + var(--fab-gap))",
      }}
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
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
