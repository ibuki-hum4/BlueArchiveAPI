'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold">Blue Archive Database</h1>
            </Link>
          </div>
          
          {/* デスクトップメニュー */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              生徒一覧
            </Link>
            <Link
              href="/api-docs"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              API使用方法
            </Link>
            <Link
              href="/terms"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              利用規約
            </Link>
            <a
              href="/api"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              API
            </a>
            <a
              href="https://github.com/ibuki-hum4/BlueArchiveAPI"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
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
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                生徒一覧
              </Link>
              <Link
                href="/api-docs"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                API使用方法
              </Link>
              <Link
                href="/terms"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                利用規約
              </Link>
              <a
                href="https://bluearchive-api.skyia.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
              >
                API
              </a>
              <a
                href="https://github.com/ibuki-hum4/BlueArchiveAPI"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}