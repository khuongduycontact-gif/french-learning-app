import Link from "next/link";

// Liên hệ nhanh - dùng lại đúng số Zalo/Messenger đang cấu hình ở nút Liên hệ nổi (ContactButton).
const ZALO_LINK = "https://zalo.me/84356935918";
const MESSENGER_LINK = "https://m.me/thu.uyen.909934";
const CONTACT_EMAIL = "celinenguyen2207@gmail.com";

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M3 9.5 10 3l7 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 8.5V16a1 1 0 0 0 1 1H14.5a1 1 0 0 0 1-1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M3.5 4.7c1.7-.8 3.7-.8 6.5.4 2.8-1.2 4.8-1.2 6.5-.4v10.6c-1.7-.8-3.7-.8-6.5.4-2.8-1.2-4.8-1.2-6.5-.4V4.7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 5.1v10.6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function TrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M6 3.5h8v3.3a4 4 0 0 1-8 0V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 4.3H3.7v1.6A2.5 2.5 0 0 0 6 8.4M14 4.3h2.3v1.6A2.5 2.5 0 0 1 14 8.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10.8v2.4M7.7 16.5h4.6M8.5 16.5v-2h3v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="6.8" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 16.5c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 2.5 16 4.7v4.6c0 4-2.6 6.9-6 8.2-3.4-1.3-6-4.2-6-8.2V4.7L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.3 9.8l1.8 1.8 3.6-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DocumentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path d="M5.5 2.5h6l3 3v11.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-13.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7.3 9h5.4M7.3 12h5.4M7.3 15h3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 6 9.15 10.2a1.5 1.5 0 0 0 1.7 0L17 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 18s6-5.2 6-9.7a6 6 0 1 0-12 0C4 12.8 10 18 10 18Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.3" r="2.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function ZaloBadge() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0068FF]">
      <span className="text-[8px] font-extrabold tracking-tight text-white">Zalo</span>
    </span>
  );
}

function MessengerBadge() {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ background: "linear-gradient(135deg, #00B2FF 0%, #006AFF 50%, #B900F9 100%)" }}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="white" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.15 2 11.26c0 2.9 1.44 5.49 3.7 7.19V22l3.38-1.86c.9.25 1.87.38 2.92.38 5.52 0 10-4.15 10-9.26C22 6.15 17.52 2 12 2Zm1.02 12.47-2.55-2.72-4.98 2.72 5.48-5.82 2.6 2.72 4.93-2.72-5.48 5.82Z" />
      </svg>
    </span>
  );
}

function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <path
        d="M10 16.5S3 12.3 3 7.8a3.3 3.3 0 0 1 6-1.9A3.3 3.3 0 0 1 15 6a3.3 3.3 0 0 1 2 5.8c-1.6 1.7-4.3 3.4-7 4.7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-base font-semibold text-ink">{children}</h3>
      <div className="ribbon-rule mt-2 !w-10" />
    </div>
  );
}

function FooterLink({
  href,
  icon,
  children,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-2.5 text-ink/70 transition hover:text-bordeaux">
      <span className="text-bordeaux/70">{icon}</span>
      {children}
    </span>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return <Link href={href}>{content}</Link>;
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-mist bg-white/40">
      <div className="mx-auto max-w-[1400px] px-6 py-14 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-8">
          {/* --- Thương hiệu --- */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col leading-tight">
              <span className="font-display text-xl font-semibold text-ink">Français</span>
              <span className="font-display text-lg italic text-bordeaux">avec Céline</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ink/60">
              Đồng hành cùng bạn trên hành trình chinh phục tiếng Pháp theo chuẩn CEFR, từ A1 đến B2.
            </p>
          </div>

          {/* --- Khám phá --- */}
          <div>
            <ColumnHeading>Khám phá</ColumnHeading>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <FooterLink href="/" icon={<HomeIcon className="h-4 w-4" />}>
                  Trang chủ
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/courses" icon={<BookIcon className="h-4 w-4" />}>
                  Khoá học
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/achievements" icon={<TrophyIcon className="h-4 w-4" />}>
                  Thành tích
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/about" icon={<UserIcon className="h-4 w-4" />}>
                  Giới thiệu về Céline
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* --- Thông tin --- */}
          <div>
            <ColumnHeading>Thông tin</ColumnHeading>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <FooterLink href="/privacy" icon={<ShieldIcon className="h-4 w-4" />}>
                  Chính sách bảo mật
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/terms" icon={<DocumentIcon className="h-4 w-4" />}>
                  Điều khoản sử dụng
                </FooterLink>
              </li>
            </ul>
          </div>

          {/* --- Liên hệ --- */}
          <div>
            <ColumnHeading>Liên hệ</ColumnHeading>
            <ul className="flex flex-col gap-3 text-sm">
              <li>
                <FooterLink href={`mailto:${CONTACT_EMAIL}`} icon={<MailIcon className="h-4 w-4" />} external>
                  {CONTACT_EMAIL}
                </FooterLink>
              </li>
              <li>
                <span className="flex items-center gap-2.5 text-ink/70">
                  <PinIcon className="h-4 w-4 text-bordeaux/70" />
                  Hà Nội, Việt Nam
                </span>
              </li>
              <li>
                <a href={ZALO_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-ink/70 transition hover:text-bordeaux">
                  <ZaloBadge />
                  Nhắn tin qua Zalo
                </a>
              </li>
              <li>
                <a href={MESSENGER_LINK} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-ink/70 transition hover:text-bordeaux">
                  <MessengerBadge />
                  Nhắn tin qua Messenger
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Đường kẻ trang trí + dòng bản quyền --- */}
        <div className="mx-auto mt-12 flex max-w-xs items-center gap-3 text-ink/20">
          <span className="h-px flex-1 bg-current" />
          <HeartIcon className="h-3.5 w-3.5 shrink-0 text-bordeaux/50" />
          <span className="h-px flex-1 bg-current" />
        </div>

        <div className="mt-5 text-center text-sm text-ink/60">
          <p className="sm:hidden">
            © {year} Français avec Céline.
            <br />♥ Học tiếng Pháp cùng Céline ♥
          </p>
          <p className="hidden sm:block">© {year} Français avec Céline. Học tiếng Pháp cùng Céline</p>
          <p className="mt-2">
            <Link href="/privacy" className="hover:text-ink">
              Chính sách bảo mật
            </Link>
            <span className="mx-2">·</span>
            <Link href="/terms" className="hover:text-ink">
              Điều khoản sử dụng
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
