'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      'relative px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200',
      isActive
        ? 'bg-ba-blue-50 text-ba-blue-700'
        : 'text-ba-navy-600 hover:text-ba-blue-700 hover:bg-ba-blue-50'
    ].join(' ');
  };

  const getMobileLinkClass = (href?: string) => {
    const isActive = href ? pathname === href : false;
    return [
      'block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200',
      isActive
        ? 'bg-ba-blue-50 text-ba-blue-700'
        : 'text-ba-navy-700 hover:bg-ba-blue-50 hover:text-ba-blue-700'
    ].join(' ');
  };

  return (
    <nav
      className="ba-soft-panel sticky top-0 z-40"
      aria-label="メインナビゲーション"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col">
              <span className="font-rounded text-lg font-extrabold tracking-wide text-ba-navy-900">
                Schale Library
              </span>
              <span className="text-[11px] tracking-wide text-ba-blue-500">
                Blue Archive Database
              </span>
            </Link>
          </div>

          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center gap-1">
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
                className="px-4 py-2 rounded-lg text-sm font-semibold text-ba-navy-600 transition-colors duration-200 hover:text-ba-blue-700 hover:bg-ba-blue-50"
              >
                {label}
              </a>
            ))}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggleMenu}
              aria-label="メインメニュー"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
            >
              {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div id="primary-navigation" className="md:hidden pb-4">
            <div className="px-2 pt-2 space-y-1 rounded-xl border border-ba-blue-100 bg-white">
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
