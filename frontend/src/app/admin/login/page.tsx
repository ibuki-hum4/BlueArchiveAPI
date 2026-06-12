'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, AdminAPIError } from '@/lib/admin-api';
import { useAdminSessionContext } from '@/hooks/useAdminSession';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loading, authenticated, refresh } = useAdminSessionContext();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace('/admin/students');
    }
  }, [loading, authenticated, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await adminLogin(password);
      await refresh();
      router.replace('/admin/students');
    } catch (err) {
      if (err instanceof AdminAPIError) {
        setError(err.status === 401 ? 'パスワードが正しくありません' : err.message);
      } else {
        setError('ログインに失敗しました');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ba-blue-50/40 px-4">
      <div className="w-full max-w-sm rounded-xl border border-ba-blue-100 bg-white p-8">
        <div className="mb-6 text-center">
          <h1 className="font-rounded text-2xl font-extrabold text-ba-navy-900">管理者ログイン</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert">
              {error}
            </div>
          )}
          <div>
            <Label htmlFor="admin-password">パスワード</Label>
            <Input
              id="admin-password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full font-bold">
            {submitting ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>
      </div>
    </div>
  );
}
