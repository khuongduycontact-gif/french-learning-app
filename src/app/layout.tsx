import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Français avec Céline — Học tiếng Pháp cùng Céline",
  description:
    "Nền tảng học tiếng Pháp trực tuyến: khoá học từ A1 đến C1, đăng ký nhanh, học theo lộ trình rõ ràng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-6 py-10">
            {children}
          </main>
          <footer className="border-t border-mist py-8 text-center text-sm text-ink/60">
            © {new Date().getFullYear()} Français avec Céline. Học tiếng Pháp cùng Céline
          </footer>
        </Providers>
      </body>
    </html>
  );
}
