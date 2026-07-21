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
      </footer>
    </>
  );
}
