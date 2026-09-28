'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, BookOpen, Code2, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { siteName } from '@/lib/site';

const INTERNAL_LINKS = [
  { href: '/', label: '生徒一覧', shortLabel: '生徒', icon: Users },
  { href: '/overview', label: '概要', shortLabel: '概要', icon: BookOpen },
  { href: '/api-docs', label: 'API使用方法', shortLabel: 'API', icon: Code2 },
  { href: '/terms', label: '利用規約', shortLabel: '規約', icon: FileText },
];

const STATIC_PATHS = new Set(INTERNAL_LINKS.map(({ href }) => href));

export default function Navigation() {
  const pathname = usePathname();

  // 生徒詳細（/{id}）は「生徒一覧」の配下として扱う
  const isActive = (href: string) =>
    pathname === href || (href === '/' && !!pathname && !STATIC_PATHS.has(pathname));

  return (
    <>
      {/* 上部に浮かぶガラスのバー */}
      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
        <nav
          aria-label="メインナビゲーション"
          className="glass mx-auto flex h-14 max-w-7xl items-center justify-between rounded-full pl-5 pr-2"
        >
          <Link href="/" className="text-[15px] font-semibold tracking-tight text-gray-900">
            {siteName}
          </Link>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              {INTERNAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive(href) ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm transition-colors',
                    isActive(href)
                      ? 'bg-gray-900/[0.06] font-medium text-gray-900'
                      : 'text-gray-500 hover:text-gray-900'
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            {/* /api は Next のページではなく Go API へ転送されるため Link ではなく a を使う */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/api"
              className="inline-flex items-center gap-0.5 rounded-full bg-gray-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              API
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </nav>
      </header>

      {/* スマホ: 画面下に浮かぶガラスのタブバー */}
      <nav
        aria-label="モバイルナビゲーション"
        className="glass fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 rounded-full p-1.5 md:hidden"
      >
        <ul className="grid grid-cols-4">
          {INTERNAL_LINKS.map(({ href, shortLabel, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium transition-colors duration-200',
                    active ? 'bg-gray-900/[0.06] text-ba-blue-600' : 'text-gray-500 active:bg-gray-900/[0.04]'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
                  {shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
