import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">ページが見つかりません</h1>
      <p className="mt-2 text-gray-500">指定された生徒またはページは存在しません。</p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        生徒一覧に戻る
      </Link>
    </main>
  );
}
