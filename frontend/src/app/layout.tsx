import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import { Suspense } from 'react';
import Analytics from '@/components/Analytics';
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
        {/* Cookie consent (Cookiebot) - runs before interactive so it can block other scripts until consent */}
        <Script
          id="Cookiebot"
          src={`https://consent.cookiebot.com/uc.js`}
          data-cbid={process.env.NEXT_PUBLIC_COOKIEBOT_ID ?? '9d73c5cf-986b-4c4f-8d96-a30e00df8f4f'}
          type="text/javascript"
          async
          strategy="beforeInteractive"
        />

        {/* Google Analytics (gtag.js) - loaded after interactive; Cookiebot can block it if needed */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID ?? 'G-Q5HTRSYCMN'}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID ?? 'G-Q5HTRSYCMN'}');`}
        </Script>
        <a href="#main-content" className="skip-link">
          コンテンツへスキップ
        </a>
        {/* Client-side analytics that records page views on route change */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
