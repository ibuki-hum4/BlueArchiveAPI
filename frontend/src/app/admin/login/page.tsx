'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin, AdminAPIError } from '@/lib/admin-api';
import { useAdminSession } from '@/hooks/useAdminSession';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loading, authenticated } = useAdminSession();
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
      <div className="w-full max-w-sm rounded-3xl border border-ba-blue-100 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="font-rounded text-sm font-bold tracking-[0.3em] text-ba-blue-500">SCHALE LIBRARY</p>
          <h1 className="font-rounded mt-2 text-2xl font-extrabold text-ba-navy-900">管理者ログイン</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-ba-navy-700">
              パスワード
            </label>
            <input
              id="admin-password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-full border border-ba-blue-200 bg-white px-4 py-2 text-ba-navy-900 focus:outline-none focus:ring-2 focus:ring-ba-blue-300 focus:border-ba-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-ba-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ba-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
