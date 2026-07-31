import type { KeyboardEvent, RefObject } from "react";

// Dùng chung cho mọi cặp ô nhập "giờ : phút" (giờ học, thời lượng buổi
// học, giờ học/buổi khoá học...) để admin dùng phím ArrowLeft/ArrowRight
// chuyển qua lại giữa ô giờ và ô phút - chỉ nhảy khi con trỏ đang ở
// đầu/cuối ô, để không phá thao tác di chuyển con trỏ bình thường trong 1
// ô có 2 chữ số.
export function handleTimeSegmentKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  opts: {
    value: string;
    prevRef?: RefObject<HTMLInputElement | null>;
    nextRef?: RefObject<HTMLInputElement | null>;
  }
) {
  const { value, prevRef, nextRef } = opts;
  const input = e.currentTarget;

  if (e.key === "ArrowLeft" && prevRef?.current && input.selectionStart === 0 && input.selectionEnd === 0) {
    e.preventDefault();
    prevRef.current.focus();
    prevRef.current.select();
    return;
  }

  if (
    e.key === "ArrowRight" &&
    nextRef?.current &&
    input.selectionStart === value.length &&
    input.selectionEnd === value.length
  ) {
    e.preventDefault();
    nextRef.current.focus();
    nextRef.current.select();
  }
}

