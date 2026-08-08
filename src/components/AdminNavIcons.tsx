import type { AdminNavIconName } from "@/lib/adminNav";

// Bộ icon dạng nét (line icon) dùng chung cho menu quản trị (1 kiểu sidebar
// cho mọi kích thước màn hình: pc, tablet, mobile). Vẽ tay bằng SVG (không
// phụ thuộc thư viện ngoài) để
// đồng bộ với các icon sẵn có trong app (viewBox 20x20, stroke="currentColor",
// strokeWidth 1.75, strokeLinecap/strokeLinejoin "round").
const ICONS: Record<AdminNavIconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.4" />
      <rect x="11" y="3" width="6" height="6" rx="1.4" />
      <rect x="3" y="11" width="6" height="6" rx="1.4" />
      <rect x="11" y="11" width="6" height="6" rx="1.4" />
    </>
  ),
  enrollment: (
    <>
      <path d="M5 3.5h7l3 3V16a.9.9 0 0 1-.9.9H5a.9.9 0 0 1-.9-.9V4.4a.9.9 0 0 1 .9-.9Z" />
      <path d="M12 3.5V7h3" />
      <path d="M6.5 10.5h7M6.5 13h4.5" />
    </>
  ),
  course: (
    <>
      <path d="M3.5 4.6c1.5-.7 3.4-.7 5 0 .3.14.5.44.5.77v8.63a.4.4 0 0 1-.57.36c-1.5-.68-3.36-.68-4.86 0a.4.4 0 0 1-.57-.36V5.02c0-.19.11-.36.3-.42Z" />
      <path d="M16.5 4.6c-1.5-.7-3.4-.7-5 0-.3.14-.5.44-.5.77v8.63c0 .28.29.47.57.36 1.5-.68 3.36-.68 4.86 0a.4.4 0 0 0 .57-.36V5.02a.46.46 0 0 0-.3-.42Z" />
    </>
  ),
  submission: (
    <>
      <path d="M5 3.5h7.2L15 6.3V16a.9.9 0 0 1-.9.9H5a.9.9 0 0 1-.9-.9V4.4a.9.9 0 0 1 .9-.9Z" />
      <path d="m6.7 10.3 1.9 1.9L13.3 8.4" />
    </>
  ),
  achievement: (
    <>
      <path d="M6 3.5h8v3.2a4 4 0 0 1-4 4 4 4 0 0 1-4-4V3.5Z" />
      <path d="M4.2 5H6v3a2.6 2.6 0 0 1-2.4-2.6c0-.22.27-.4.6-.4Z" />
      <path d="M15.8 5H14v3a2.6 2.6 0 0 0 2.4-2.6c0-.22-.27-.4-.6-.4Z" />
      <path d="M10 10.7v2.3M7.7 16.5h4.6l-.6-2.1a.9.9 0 0 0-.86-.65H9.16a.9.9 0 0 0-.86.65l-.6 2.1Z" />
    </>
  ),
  schedule: (
    <>
      <rect x="3" y="4" width="14" height="12.5" rx="1.6" />
      <path d="M3 7.6h14M6.5 2.5v3M13.5 2.5v3" />
      <path d="M6.7 10.6h1.4M9.3 10.6h1.4M11.9 10.6h1.4M6.7 13.2h1.4M9.3 13.2h1.4" />
    </>
  ),
  about: (
    <>
      <circle cx="10" cy="6.4" r="2.9" />
      <path d="M4 16.3c.7-3 3-4.8 6-4.8s5.3 1.8 6 4.8" />
    </>
  ),
  book: (
    <>
      <path d="M4 4.3c1.6-.7 3.6-.7 5.2 0 .3.14.5.44.5.77v9.63a.4.4 0 0 1-.57.36c-1.5-.68-3.36-.68-4.86 0A.68.68 0 0 1 3.3 14.4V5.07c0-.33.2-.63.5-.77Z" />
      <path d="M16 4.3c-1.6-.7-3.6-.7-5.2 0-.3.14-.5.44-.5.77v9.63c0 .28.29.47.57.36 1.5-.68 3.36-.68 4.86 0a.68.68 0 0 0 .97-.36V5.07a.85.85 0 0 0-.5-.77Z" />
    </>
  ),
  bookPurchase: (
    <>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.6" />
      <path d="M2.5 8h15" />
      <path d="M5.5 11.7h3" />
    </>
  ),
  trustedWebsite: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c1.8 2 2.8 4.4 2.8 7s-1 5-2.8 7c-1.8-2-2.8-4.4-2.8-7s1-5 2.8-7Z" />
    </>
  ),
};

export default function AdminNavIcon({
  name,
  className,
}: {
  name: AdminNavIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
