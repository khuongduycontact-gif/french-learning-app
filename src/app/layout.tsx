import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ScrollToTop from "@/components/ScrollToTop";
import DictionaryLookup from "@/components/DictionaryLookup";
import BackToTop from "@/components/BackToTop";
import ContactButton from "@/components/ContactButton";

const display = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin", "vietnamese"],
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
          <ScrollToTop />
          {children}
          <BackToTop />
          <DictionaryLookup />
          <ContactButton />
        </Providers>
      </body>
    </html>
  );
}
