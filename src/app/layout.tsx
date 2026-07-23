import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ScrollToTop from "@/components/ScrollToTop";
import DictionaryLookup from "@/components/DictionaryLookup";
import BackToTop from "@/components/BackToTop";
import ContactButton from "@/components/ContactButton";

// TODO: khi mua domain riêng (vd: francaisavecceline.com), đổi giá trị này —
// toàn bộ metadata, sitemap.xml, robots.txt sẽ tự dùng domain mới.
export const SITE_URL = "https://francaisavecceline.vercel.app";
const SITE_NAME = "Français avec Céline";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Français avec Céline — Học tiếng Pháp cùng Céline",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Nền tảng học tiếng Pháp trực tuyến: khoá học từ A1 đến C1, đăng ký nhanh, học theo lộ trình rõ ràng.",
  keywords: [
    "Français avec Céline",
    "học tiếng Pháp",
    "học tiếng Pháp online",
    "khoá học tiếng Pháp A1",
    "luyện thi DELF DALF",
    "Céline dạy tiếng Pháp",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Français avec Céline — Học tiếng Pháp cùng Céline",
    description:
      "Nền tảng học tiếng Pháp trực tuyến: khoá học từ A1 đến C1, đăng ký nhanh, học theo lộ trình rõ ràng.",
    images: [{ url: "/logo-app.png", width: 1254, height: 1254, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: "Français avec Céline — Học tiếng Pháp cùng Céline",
    description:
      "Nền tảng học tiếng Pháp trực tuyến: khoá học từ A1 đến C1, đăng ký nhanh, học theo lộ trình rõ ràng.",
    images: ["/logo-app.png"],
  },
  icons: {
    icon: "/logo-app.png",
    apple: "/logo-app.png",
  },
  // TODO: dán mã xác minh lấy từ Google Search Console (Settings > Ownership
  // verification > HTML tag) vào đây, dạng: verification: { google: "abc123..." }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "French avec Celine",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-app.png`,
  description:
    "Nền tảng học tiếng Pháp trực tuyến: khoá học từ A1 đến C1, đăng ký nhanh, học theo lộ trình rõ ràng.",
  sameAs: [
    "https://www.facebook.com/thu.uyen.909934",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
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
