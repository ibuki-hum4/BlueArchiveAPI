import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from 'next/script';
import { Suspense } from 'react';
import Analytics from '@/components/Analytics';
import Navigation from '@/components/Navigation';
import SiteFooter from '@/components/SiteFooter';
import { buildOgImageUrl, siteDescription, siteName, siteUrl } from '@/lib/site';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ノッチ・ホームインジケーター領域まで描画し、下部タブバーは safe-area-inset で避ける
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#eaf3ff",
};

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
        url: buildOgImageUrl(),
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
    images: [buildOgImageUrl()],
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
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col supports-[height:100dvh]:min-h-dvh pb-[calc(env(safe-area-inset-bottom)+6rem)] antialiased md:pb-10`}
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
        <Navigation />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
