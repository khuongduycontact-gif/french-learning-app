"use client";

import { useEffect, useRef } from "react";

type Props = {
  url: string;
  name?: string;
  kind: "image" | "video";
  /** Nhãn nhận diện (vd: email học viên) in mờ lên tài liệu để hạn chế phát tán. */
  watermarkLabel?: string;
  onClose: () => void;
};

// LƯU Ý QUAN TRỌNG: trình duyệt không có cách nào chặn tuyệt đối việc chụp
// màn hình / quay màn hình ở cấp hệ điều hành. Các biện pháp dưới đây (ẩn nút
// tải, chặn chuột phải/kéo thả, chặn vài phím tắt lưu tệp, in watermark) chỉ
// là hàng rào hạn chế và làm giảm giá trị của bản sao chép nếu bị phát tán,
// không phải giải pháp bảo mật tuyệt đối.
export default function SecureMediaViewer({
  url,
  name,
  kind,
  watermarkLabel,
  onClose,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      const key = e.key.toLowerCase();
      // Chặn bớt các phím tắt lưu tệp / in phổ biến ngay trong lúc xem.
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "p" || key === "u")) {
        e.preventDefault();
      }
      if (key === "printscreen") {
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Tạm dừng video khi tab bị ẩn/mất focus (một số công cụ ghi màn hình
  // khiến tab chuyển nền) — chỉ mang tính giảm thiểu, không tuyệt đối.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) videoRef.current?.pause();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const watermarkText = watermarkLabel
    ? `Chỉ xem trực tuyến · ${watermarkLabel}`
    : "Chỉ xem trực tuyến · Không sao chép";

  return (
    <div
      className="fixed inset-0 z-[60] flex select-none items-center justify-center bg-slate-400/60 backdrop-blur-sm p-4"
      style={{ WebkitTouchCallout: "none" } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => {
        // Chỉ đóng khi bấm đúng vào lớp phủ nền, không đóng khi bấm vào ảnh/video bên trong
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={name || "Xem tài liệu học"}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-parchment"
      >
        ✕
      </button>

      {name && (
        <p className="absolute left-4 top-4 max-w-[65%] truncate rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-ink shadow-sm">
          {name}
        </p>
      )}

      <div className="relative max-h-[85vh] max-w-[92vw] overflow-hidden rounded-xl bg-black/20">
        {kind === "image" ? (
          <img
            src={url}
            alt={name || "Tài liệu học"}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className="block max-h-[85vh] max-w-[92vw] select-none object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={url}
            controls
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            playsInline
            autoPlay
            className="block max-h-[85vh] max-w-[92vw]"
          />
        )}

        {/* Watermark lặp lại theo dạng lưới nghiêng, chỉ mang tính hạn chế/nhận
            diện nguồn phát tán, không chặn được việc chụp/quay màn hình. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center gap-6 p-4"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="-rotate-[25deg] whitespace-nowrap text-[11px] font-semibold text-white/25"
            >
              {watermarkText}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
