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
      <footer className="border-t border-mist py-8 text-center text-sm text-ink/60">
        <p className="sm:hidden">
          © {new Date().getFullYear()} Français avec Céline.
          <br />♥ Học tiếng Pháp cùng Céline ♥
        </p>
        <p className="hidden sm:block">
          © {new Date().getFullYear()} Français avec Céline. Học tiếng Pháp cùng Céline
        </p>
        <p className="mt-3">
          <a href="/privacy" className="underline decoration-mist underline-offset-2 hover:text-ink">
            Chính sách bảo mật
          </a>
          <span className="mx-2">·</span>
          <a href="/terms" className="underline decoration-mist underline-offset-2 hover:text-ink">
            Điều khoản sử dụng
          </a>
        </p>
      </footer>
    </>
  );
}
