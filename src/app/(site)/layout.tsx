import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      <Footer />
    </>
  );
}
