'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminSession } from '@/hooks/useAdminSession';
import { adminLogout } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, authenticated, refresh } = useAdminSession();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !loading && !authenticated) {
      router.replace('/admin/login');
    }
  }, [isLoginPage, loading, authenticated, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ba-blue-50/40">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-ba-blue-100 border-t-ba-blue-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    await adminLogout();
    await refresh();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-ba-blue-50/40 text-ba-navy-900">
      <nav className="ba-soft-panel sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin/students" className="flex flex-col">
              <span className="font-rounded text-lg font-extrabold tracking-wide text-ba-navy-900">
                Schale Library
              </span>
              <span className="text-[11px] tracking-wide text-ba-blue-500">管理者ダッシュボード</span>
            </Link>
            <Button asChild variant="ghost">
              <Link href="/admin/students">生徒管理</Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/">サイトを表示</Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
