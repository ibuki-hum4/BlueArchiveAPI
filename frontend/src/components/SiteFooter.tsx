import Link from 'next/link';
import { siteName } from '@/lib/site';

const LINKS = [
  { href: '/', label: '生徒一覧' },
  { href: '/overview', label: '概要' },
  { href: '/api-docs', label: 'API使用方法' },
  { href: '/terms', label: '利用規約' },
];

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-t border-gray-200 py-8 text-sm md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="font-semibold text-gray-900">{siteName}</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            非公式のファンメイドデータベースです。ゲーム内の名称・データに関する権利は各権利者に帰属します。
          </p>
        </div>

        <nav aria-label="フッターナビゲーション" className="flex flex-wrap gap-x-6 gap-y-2 text-gray-500">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className="hover:text-gray-900">
              {label}
            </Link>
          ))}
          <a href="/rss.xml" className="hover:text-gray-900">RSS</a>
          <a
            href="https://github.com/ibuki-hum4/BlueArchiveAPI"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
