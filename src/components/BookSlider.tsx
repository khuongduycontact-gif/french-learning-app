"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Book } from "@/types";
import { formatVnd } from "@/lib/format";
import { stripRichText } from "@/lib/richtext";

// Tốc độ tự chạy: pixel/giây
const AUTO_SPEED = 45;
// Sau bao lâu (ms) không có thao tác vuốt/kéo thì mới tự chạy lại
const RESUME_DELAY = 2000;
// Sai số cho phép khi so sánh chiều rộng nội dung với khung nhìn, tránh
// bật/tắt liên tục ở ngưỡng biên (do làm tròn số).
const OVERFLOW_TOLERANCE = 2;

// Icon nhỏ dùng cho ô giá sách - cùng kiểu với ô "Học phí" trên CourseCard
// và ô "Giá sách" trên BookCard để đồng bộ bố cục khi hover.
function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.59 13.41 12 22 2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BookTile({ book }: { book: Book }) {
  const initial = book.title.trim().slice(0, 1).toUpperCase();
  const plainDescription = stripRichText(book.description);
  return (
    <Link
      href={`/books/${book.id}`}
      draggable={false}
      className="group block w-[168px] shrink-0 select-none transform-gpu rounded-2xl shadow-sm transition duration-300 hover:-translate-y-1 sm:w-[188px]"
    >
      {/* Khối bo góc + cắt nội dung (overflow-hidden) tách riêng khỏi thẻ
          <Link> ở ngoài - thẻ ngoài chỉ giữ shadow/rounded-2xl/hover. Nếu
          overflow-hidden nằm chung khối với shadow, khi track slider được
          transform liên tục (tự chạy) trình duyệt có thể vẽ sai khiến bóng
          hover to ra và mất bo góc, không ôm sát thẻ như thẻ khoá học tĩnh.
          transform-gpu: ép thẻ có layer GPU riêng, tách khỏi transform liên
          tục của track cha, để bóng đổ luôn mỏng/ôm sát và giữ bo góc giống
          hệt CourseCard thay vì bị vẽ to/vuông khi track đang tự chạy. */}
      <div className="overflow-hidden rounded-2xl border border-mist bg-white">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
          <div className="h-full w-full p-2">
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  draggable={false}
                  sizes="188px"
                  className="object-cover pointer-events-none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-100 via-indigo-50/70 to-white">
                  <span className="select-none font-body text-5xl font-bold text-indigo-400">
                    {initial}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          <p className="min-w-0 font-body text-xs text-ink">
            <span className="font-semibold">Tên sách: </span>
            <span className="font-bold">{book.title}</span>
          </p>
          {plainDescription && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-ink/40">
                Nội dung
              </span>
              <p className="line-clamp-1 min-w-0 text-xs text-ink/60">
                {plainDescription}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5">
            <TagIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            <p className="truncate text-xs font-bold text-ink">
              {book.price > 0 ? formatVnd(book.price) : "Miễn phí"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BookSlider({ books }: { books: Book[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Chỉ bật hiệu ứng chạy vòng (nhân đôi danh sách + tự trượt) khi nội
  // dung đủ dài để tràn hết 1 hàng ngang. Nếu chưa đủ 1 hàng (ví dụ chỉ
  // có 1-2 quyển sách) thì hiển thị tĩnh, không nhân đôi, không tự chạy.
  const [loopEnabled, setLoopEnabled] = useState(false);
  const loopEnabledRef = useRef(false);
  useEffect(() => {
    loopEnabledRef.current = loopEnabled;
  }, [loopEnabled]);

  // Vị trí cuộn hiện tại (px, luôn <= 0), lưu trong ref để cập nhật mỗi
  // khung hình mà không phải render lại React.
  const positionRef = useRef(0);
  // Chiều rộng của đúng 1 bộ danh sách sách (chưa nhân đôi) - dùng để lặp
  // vòng liền mạch (khi cuộn hết 1 bộ thì cộng lại đúng bằng chiều rộng đó).
  const setWidthRef = useRef(0);

  const draggingRef = useRef(false);
  const hoveringRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPosRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const suppressClickRef = useRef(false);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedByIdleRef = useRef(false);

  function applyTransform() {
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
    }
  }

  // Đưa vị trí về đúng khoảng (-setWidth, 0] để cuộn vòng liền mạch (danh
  // sách đã được nhân đôi trong JSX bên dưới).
  function wrapPosition() {
    const setWidth = setWidthRef.current;
    if (setWidth <= 0) return;
    while (positionRef.current <= -setWidth) positionRef.current += setWidth;
    while (positionRef.current > 0) positionRef.current -= setWidth;
  }

  // Đo chiều rộng nội dung để quyết định có bật chế độ chạy vòng hay
  // không: chỉ bật khi 1 bộ danh sách rộng hơn khung nhìn (tràn 1 hàng).
  function measure() {
    const track = trackRef.current;
    const viewport = viewportRef.current;
    if (!track || !viewport) return;

    const viewportWidth = viewport.clientWidth;
    // Khi đang ở chế độ chạy vòng, track chứa 2 bộ liền nhau -> 1 bộ = nửa
    // tổng chiều rộng. Khi chưa bật, track chỉ chứa đúng 1 bộ.
    const rawSetWidth = loopEnabledRef.current
      ? track.scrollWidth / 2
      : track.scrollWidth;
    setWidthRef.current = rawSetWidth;

    const shouldLoop = rawSetWidth > viewportWidth + OVERFLOW_TOLERANCE;
    if (shouldLoop !== loopEnabledRef.current) {
      loopEnabledRef.current = shouldLoop;
      setLoopEnabled(shouldLoop);
      positionRef.current = 0;
      applyTransform();
    }
  }

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    let raf = 0;
    let lastTime: number | null = null;

    function tick(time: number) {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const shouldAutoPlay =
        loopEnabledRef.current &&
        !draggingRef.current &&
        !hoveringRef.current &&
        !pausedByIdleRef.current;

      if (shouldAutoPlay && setWidthRef.current > 0) {
        positionRef.current -= AUTO_SPEED * dt;
        wrapPosition();
        applyTransform();
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.length, loopEnabled]);

  // Cho phép vuốt ngang bằng trackpad (2 ngón) để kéo slider thủ công.
  // Chỉ chặn hành vi cuộn mặc định khi rõ ràng là vuốt ngang (deltaX lớn
  // hơn deltaY), để không cản trở việc cuộn dọc trang bằng chuột thường.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    function onWheel(e: WheelEvent) {
      if (!loopEnabledRef.current) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX <= absY || absX < 2) return;

      e.preventDefault();
      positionRef.current -= e.deltaX;
      wrapPosition();
      applyTransform();

      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      pausedByIdleRef.current = false;
      scheduleResume();
    }

    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scheduleResume() {
    pausedByIdleRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      pausedByIdleRef.current = false;
    }, RESUME_DELAY);
  }

  function handlePointerDown(e: React.PointerEvent) {
    // Chưa đủ nội dung để cuộn thì không có gì để kéo cả.
    if (!loopEnabledRef.current) return;
    // Chỉ theo dõi 1 điểm chạm/con trỏ tại 1 thời điểm
    draggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPosRef.current = positionRef.current;
    dragDistanceRef.current = 0;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    pausedByIdleRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    dragDistanceRef.current = Math.abs(delta);
    positionRef.current = dragStartPosRef.current + delta;
    wrapPosition();
    applyTransform();
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    // Vuốt (kéo) đủ xa thì coi là thao tác vuốt slider, không phải bấm vào
    // sách -> chặn sự kiện click điều hướng ngay sau đó.
    if (dragDistanceRef.current > 6) {
      suppressClickRef.current = true;
    }
    // Vuốt thủ công xong -> sau 2 giây không thao tác gì thêm thì mới tự chạy lại
    scheduleResume();
  }

  function handleClickCapture(e: React.MouseEvent) {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  }

  function handlePointerEnter(e: React.PointerEvent) {
    // "Khi chuột hover vào truyện nào thì dừng lại ở chuyện đấy" - chỉ áp
    // dụng cho chuột (mouse), không áp dụng cho chạm (touch) vì trên di
    // động không có khái niệm "hover".
    if (e.pointerType !== "mouse") return;
    hoveringRef.current = true;
  }

  function handlePointerLeave() {
    hoveringRef.current = false;
  }

  if (books.length === 0) return null;

  // Chỉ nhân đôi danh sách (để cuộn vòng liền mạch) khi đã xác định nội
  // dung tràn quá 1 hàng ngang; nếu không, hiển thị đúng 1 bộ như thực tế.
  const displayedBooks = loopEnabled ? [...books, ...books] : books;

  return (
    <div
      ref={viewportRef}
      className="relative -my-3 w-full overflow-hidden py-3"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={handleClickCapture}
        className={`flex w-max gap-4 touch-pan-y select-none ${
          loopEnabled ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ willChange: "transform" }}
      >
        {displayedBooks.map((b, i) => (
          <BookTile key={`${b.id}-${i}`} book={b} />
        ))}
      </div>
    </div>
  );
}
