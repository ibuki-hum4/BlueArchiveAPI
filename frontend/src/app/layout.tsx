import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteName = "Blue Archive API";
const siteDescription = "ブルーアーカイブの生徒データを検索・閲覧できる非公式データベース";
const siteUrl = "https://bluearchive-api.skyia.jp";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "ブルーアーカイブ",
    "Blue Archive",
    "生徒データ",
    "キャラクター検索",
    "ゲームデータベース",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: `${siteName}のOGP画像`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/og"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          コンテンツへスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
