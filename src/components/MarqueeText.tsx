"use client";

// Hiển thị 1 dòng chữ không xuống dòng; nếu chữ dài hơn khung chứa thì tự
// động chạy ngang liên tục (marquee) như đèn LED, không cần người dùng
// vuốt/cuộn tay. Nếu chữ đủ ngắn (không tràn khung) thì hiển thị bình
// thường, không chạy.

import { useEffect, useRef, useState } from "react";

export default function MarqueeText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [duration, setDuration] = useState(8);

  useEffect(() => {
    function check() {
      const viewport = viewportRef.current;
      const measure = measureRef.current;
      if (!viewport || !measure) return;
      const over = measure.scrollWidth > viewport.clientWidth + 1;
      setOverflowing(over);
      if (over) {
        // Tốc độ chạy tỉ lệ theo độ dài chữ - chữ càng dài chạy càng lâu để
        // tốc độ đọc luôn ổn định, không phụ thuộc số ký tự nhiều hay ít.
        setDuration(Math.max(5, measure.scrollWidth / 35));
      }
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text]);

  return (
    <div ref={viewportRef} className={`marquee-viewport ${className}`}>
      {/* Bản ẩn chỉ dùng để đo độ rộng thật của chữ, không hiển thị. */}
      <span ref={measureRef} className="marquee-measure" aria-hidden="true">
        {text}
      </span>
      {overflowing ? (
        <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
          <span className="marquee-copy">{text}</span>
          <span className="marquee-copy" aria-hidden="true">
            {text}
          </span>
        </div>
      ) : (
        <span className="marquee-static">{text}</span>
      )}
    </div>
  );
}
