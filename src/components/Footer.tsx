import Link from "next/link";

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

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="font-display text-base font-semibold text-ink">{children}</h3>
      <div className="ribbon-rule mt-2 !w-16" />
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
    <footer className="relative overflow-hidden border-t border-mist bg-parchment bg-[length:220px_auto] bg-[position:left_bottom,right_bottom] bg-no-repeat [background-image:url('/images/footer-corner-left.webp'),url('/images/footer-corner-right.webp')] sm:bg-[length:280px_auto,320px_auto]">
      <div className="relative mx-auto max-w-[1400px] px-6 py-10 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:flex md:flex-row md:flex-wrap md:justify-between md:gap-x-8 md:gap-y-0">
          {/* --- Thương hiệu --- */}
          <div className="col-span-2 md:col-span-1 md:max-w-[240px]">
            <div className="flex flex-col leading-tight sm:flex-row sm:items-baseline sm:gap-2">
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
          <div className="col-span-2 md:col-span-1">
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
            </ul>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4 sm:gap-6">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-bordeaux/30 to-bordeaux/30" />
          <svg viewBox="0 0 64 60" className="h-10 w-10 shrink-0 text-bordeaux/60" fill="none" aria-hidden>
            {/* Dải ruy băng tạo hình trái tim */}
            <path
              d="M32,54 C10,38 2,24 10,14 C16,7 26,10 27,20 C27,20 24,16 18,17 C13,18 12,23 16,25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M32,54 C54,38 62,24 54,14 C48,7 38,10 37,20 C37,20 40,16 46,17 C51,18 52,23 48,25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ba thân lúa mọc lên từ giữa trái tim */}
            <path d="M32,32 C29,24 26,14 24,6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M32,32 C32,22 32,12 32,4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M32,32 C35,24 38,14 40,6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />

            {/* Hạt lúa - thân trái */}
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(30.5,24) rotate(-49) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(30.5,24) rotate(19) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(28.5,17) rotate(-43) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(28.5,17) rotate(13) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(27,12.5) rotate(-37) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(27,12.5) rotate(7) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(25.5,8) rotate(-31) scale(0.55)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(25.5,8) rotate(1) scale(0.55)" />

            {/* Hạt lúa - thân giữa */}
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(32,24) rotate(-34) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(32,24) rotate(34) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(32,17) rotate(-28) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(32,17) rotate(28) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(32,11) rotate(-22) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(32,11) rotate(22) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.9" transform="translate(32,5.5) rotate(-16) scale(0.55)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.9" transform="translate(32,5.5) rotate(16) scale(0.55)" />

            {/* Hạt lúa - thân phải */}
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(34,24) rotate(-19) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(34,24) rotate(49) scale(1)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(36,17) rotate(-13) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.8" transform="translate(36,17) rotate(43) scale(0.85)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(38,12.5) rotate(-7) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(38,12.5) rotate(37) scale(0.7)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(39.5,8) rotate(-1) scale(0.55)" />
            <path d="M0,0 C-2.6,-0.8 -2.8,-4.4 0,-7.2 C2.8,-4.4 2.6,-0.8 0,0 Z" fill="currentColor" fillOpacity="0.85" transform="translate(39.5,8) rotate(31) scale(0.55)" />
          </svg>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-bordeaux/30 to-bordeaux/30" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm text-ink/60">
          <span>
            © {year} Français avec Céline
          </span>
          <svg viewBox="0 0 20 18" className="h-3.5 w-3.5 shrink-0" aria-hidden>
            <defs>
              <clipPath id="footerHeartFrClip">
                <path d="M10 17S1.5 11.8 1.5 6.4A4.4 4.4 0 0 1 10 4.3a4.4 4.4 0 0 1 8.5 2.1C18.5 11.8 10 17 10 17Z" />
              </clipPath>
            </defs>
            <g clipPath="url(#footerHeartFrClip)">
              <rect x="0" y="0" width="6.7" height="18" fill="#0055A4" />
              <rect x="6.7" y="0" width="6.6" height="18" fill="#FFFFFF" />
              <rect x="13.3" y="0" width="6.7" height="18" fill="#EF4135" />
            </g>
            <path
              d="M10 17S1.5 11.8 1.5 6.4A4.4 4.4 0 0 1 10 4.3a4.4 4.4 0 0 1 8.5 2.1C18.5 11.8 10 17 10 17Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.6"
              strokeOpacity="0.3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </footer>
  );
}
