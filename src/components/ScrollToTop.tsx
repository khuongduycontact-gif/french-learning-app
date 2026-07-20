"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Next.js App Router không phải lúc nào cũng tự quay về đầu trang khi
// điều hướng bằng <Link>/router.push (đặc biệt khi trang trước đó đã
// cuộn xuống). Component này đảm bảo mỗi lần đổi route sẽ cuộn về đầu.
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
