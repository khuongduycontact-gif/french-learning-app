import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1400px] px-6 py-10 md:px-10">
        {children}
      </main>
      <footer className="border-t border-mist py-10 text-center text-sm text-ink/60">
        <p className="sm:hidden">
          © {new Date().getFullYear()} Français avec Céline.
          <br />♥ Học tiếng Pháp cùng Céline ♥
        </p>
        <p className="hidden sm:block">
          © {new Date().getFullYear()} Français avec Céline. Học tiếng Pháp cùng Céline
        </p>

        <div className="mx-auto mt-5 flex flex-col items-center gap-2.5 text-xs sm:flex-row sm:justify-center sm:gap-6">
          <a href="mailto:celinenguyen2207@gmail.com" className="flex items-center gap-1.5 hover:text-ink">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <rect x="2.5" y="4.5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M3 6 9.15 10.2a1.5 1.5 0 0 0 1.7 0L17 6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            celinenguyen2207@gmail.com
          </a>
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path
                d="M10 18s6-5.2 6-9.7a6 6 0 1 0-12 0C4 12.8 10 18 10 18Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="8.3" r="2.1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            Hà Nội, Việt Nam
          </span>
        </div>

        <div className="mx-auto mt-5 flex max-w-xs items-center gap-3 text-ink/20">
          <span className="h-px flex-1 bg-current" />
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-bordeaux/50" aria-hidden="true">
            <path
              d="M10 16.5S3 12.3 3 7.8a3.3 3.3 0 0 1 6-1.9A3.3 3.3 0 0 1 15 6a3.3 3.3 0 0 1 2 5.8c-1.6 1.7-4.3 3.4-7 4.7Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span className="h-px flex-1 bg-current" />
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
          <a href="/privacy" className="flex items-center gap-1.5 hover:text-ink">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path
                d="M10 2.5 16 4.7v4.6c0 4-2.6 6.9-6 8.2-3.4-1.3-6-4.2-6-8.2V4.7L10 2.5Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path d="M7.3 9.8l1.8 1.8 3.6-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Chính sách bảo mật
          </a>
          <span className="mx-1">·</span>
          <a href="/terms" className="flex items-center gap-1.5 hover:text-ink">
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0" aria-hidden="true">
              <path d="M5.5 2.5h6l3 3v11.5a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-13.5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M7.3 9h5.4M7.3 12h5.4M7.3 15h3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Điều khoản sử dụng
          </a>
        </p>
      </footer>
    </>
  );
}
