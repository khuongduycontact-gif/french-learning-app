import Navbar from "@/components/Navbar";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-6 py-10">
        {children}
      </main>
      <footer className="border-t border-mist py-8 text-center text-sm text-ink/60">
        <span>© {new Date().getFullYear()} Français avec Céline</span>

        <span className="hidden sm:inline"> • </span>

        <span className="block sm:inline">
          Học tiếng Pháp cùng Céline ♡
        </span>
      </footer>
    </>
  );
}
