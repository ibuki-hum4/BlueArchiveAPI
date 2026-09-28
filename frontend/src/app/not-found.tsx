import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ba-blue-50/40 text-ba-navy-900">
      <Navigation />
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="font-rounded text-2xl font-extrabold">ページが見つかりません</h1>
        <p className="mt-2 text-ba-navy-500">指定された生徒またはページは存在しません。</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-lg bg-ba-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-ba-blue-700"
        >
          生徒一覧に戻る
        </Link>
      </main>
    </div>
  );
}
