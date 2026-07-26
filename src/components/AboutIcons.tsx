// Bộ icon nội tuyến (không phụ thuộc thư viện ngoài) dùng cho các mục có
// thể chọn biểu tượng trong trang "Giới thiệu về tôi": hành trình, lý do
// chọn học, thành tích nổi bật. Lưu trong CSDL dưới dạng khoá chuỗi (VD:
// "book"), trang public tra vào đây để render đúng icon.

type IconProps = { className?: string };

function Target({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function Book({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 5.5c2-1 4.5-1 8 0.5 3.5-1.5 6-1.5 8-0.5v13c-2-1-4.5-1-8 0.5-3.5-1.5-6-1.5-8-0.5v-13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 6v13" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Headphones({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 14v-2a8 8 0 0 1 16 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="3" y="14" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Heart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20s-7.5-4.6-10-9.3C0.3 7 2 3.5 5.5 3.2c2-.2 3.6.9 4.5 2.4.9-1.5 2.5-2.6 4.5-2.4C18 3.5 19.7 7 22 10.7 19.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GraduationCap({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 10.7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M21 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Medal({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="14.5" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 2.5 6.5 9l2.7 1 1.6-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15 2.5 17.5 9l-2.7 1-1.6-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 11.5v6M9.3 14h5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Certificate({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 8h10M7 11.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 16v4l3-1.5L15 20v-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Plane({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M21 12 3 6l2 5-2 1 8 1 2 6 2-5 6-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chalkboard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="4" width="18" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 19h6M12 15v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 9.5 10 7l2 2 3-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3c.6 3.4 2.2 5 5.6 5.6-3.4.6-5 2.2-5.6 5.6-.6-3.4-2.2-5-5.6-5.6C9.8 8 11.4 6.4 12 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M18.5 15.5c.3 1.7 1.1 2.5 2.8 2.8-1.7.3-2.5 1.1-2.8 2.8-.3-1.7-1.1-2.5-2.8-2.8 1.7-.3 2.5-1.1 2.8-2.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function Trophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 13v3M9 20h6M10 20v-2.5h4V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Users({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 6a3 3 0 0 1 0 6M21 19c0-2.6-2-4.5-4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export const aboutIconMap: Record<string, (props: IconProps) => JSX.Element> = {
  target: Target,
  book: Book,
  headphones: Headphones,
  heart: Heart,
  "graduation-cap": GraduationCap,
  medal: Medal,
  star: Star,
  certificate: Certificate,
  plane: Plane,
  chalkboard: Chalkboard,
  sparkle: Sparkle,
  trophy: Trophy,
  users: Users,
};

export const aboutIconOptions: { key: string; label: string }[] = [
  { key: "target", label: "Mục tiêu" },
  { key: "book", label: "Sách" },
  { key: "headphones", label: "Tai nghe" },
  { key: "heart", label: "Trái tim" },
  { key: "graduation-cap", label: "Tốt nghiệp" },
  { key: "medal", label: "Huy chương" },
  { key: "star", label: "Ngôi sao" },
  { key: "certificate", label: "Chứng chỉ" },
  { key: "plane", label: "Máy bay" },
  { key: "chalkboard", label: "Bảng giảng" },
  { key: "sparkle", label: "Lấp lánh" },
  { key: "trophy", label: "Cúp" },
  { key: "users", label: "Học viên" },
];

export function AboutIcon({
  name,
  className,
  color = "8C2F35", // mã màu bordeaux mặc định (không có dấu #, dùng để bake màu vào SVG lấy từ Iconify)
}: {
  name: string;
  className?: string;
  color?: string;
}) {
  // Icon lấy từ kho Iconify (icon-set:icon-name, ví dụ "mdi:airplane") - gọi qua API ảnh
  // công khai của Iconify, không cần cài thêm gói hay lưu file icon trong dự án.
  if (name && name.includes(":")) {
    return (
      <img
        src={`https://api.iconify.design/${name}.svg?color=%23${color}`}
        alt=""
        className={className}
        loading="lazy"
      />
    );
  }
  const Cmp = aboutIconMap[name] || Star;
  return <Cmp className={className} />;
}
