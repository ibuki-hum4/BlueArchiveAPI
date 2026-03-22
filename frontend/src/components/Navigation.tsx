'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const INTERNAL_LINKS = [
  { href: '/', label: '生徒一覧' },
  { href: '/overview', label: '概要' },
  { href: '/api-docs', label: 'API使用方法' },
  { href: '/terms', label: '利用規約' },
];

const EXTERNAL_LINKS = [
  { href: '/api', label: 'API' },
  { href: 'https://github.com/ibuki-hum4/BlueArchiveAPI', label: 'GitHub', external: true },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleMenuNavigate = () => {
    setIsMenuOpen(false);
  };

  const getDesktopLinkClass = (href: string) => {
    const isActive = pathname === href;
    return [
      'relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 border',
      isActive
        ? 'border-slate-400 bg-white text-slate-900'
        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
    ].join(' ');
  };

  const getMobileLinkClass = (href?: string) => {
    const isActive = href ? pathname === href : false;
    return [
      'block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200',
      isActive
        ? 'bg-slate-200 text-slate-900'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    ].join(' ');
  };

  return (
    <nav
      className="sticky top-0 z-40 border-b border-slate-300 bg-[#fdfdfd] text-slate-800"
      aria-label="メインナビゲーション"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-semibold tracking-wide text-slate-900">Blue Archive Database</span>
              <span className="text-xs tracking-wide text-slate-500">API &amp; データブラウジングポータル</span>
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-2">
            {INTERNAL_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className={getDesktopLinkClass(href)}>
                {label}
              </Link>
            ))}
            {EXTERNAL_LINKS.map(({ href, label, external }) => (
              <a
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900 hover:bg-slate-100/70"
              >
                {label}
              </a>
            ))}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="メインメニュー"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div id="primary-navigation" className="md:hidden pb-4">
            <div className="px-2 pt-2 space-y-1 rounded-lg border border-slate-300 bg-white">
              {INTERNAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={getMobileLinkClass(href)}
                  onClick={handleMenuNavigate}
                >
                  {label}
                </Link>
              ))}
              {EXTERNAL_LINKS.map(({ href, label, external }) => (
                <a
                  key={href}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className={getMobileLinkClass()}
                  onClick={handleMenuNavigate}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}