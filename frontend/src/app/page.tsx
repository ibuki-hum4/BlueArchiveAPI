'use client';

import { useEffect, useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import StudentCard from '@/components/StudentCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useStudents } from '@/hooks/useStudents';

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 24;

export default function Home() {
  const {
    students,
    totalCount,
    uniqueSchools,
    uniqueWeaponTypes,
    loading,
    error,
    handleFilterChange,
    handleSortChange,
  } = useStudents();
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleStudents = useMemo(
    () => students.slice(0, visibleCount),
    [students, visibleCount]
  );

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [students]);

  const hasMore = students.length > visibleStudents.length;
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center" role="alert">
            <h2 className="text-2xl font-bold text-red-600">エラーが発生しました</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navigation />

      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10"
      >
        <section id="explore" className="space-y-8">
          <div className="flex flex-col gap-3 border-b border-slate-300/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">おかえりなさい、先生！</h2>
              <p className="text-sm text-slate-600">
                豊富なフィルターと並べ替え機能で目的の生徒さんをすぐに見つけられます。
              </p>
            </div>
            <div className="text-sm text-slate-600" role="status" aria-live="polite">
              現在 {totalCount} 件の生徒さんが条件に一致しています
            </div>
          </div>

          <SearchAndFilter
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            totalCount={totalCount}
            schools={uniqueSchools}
            weaponTypes={uniqueWeaponTypes}
          />
        </section>

        <section aria-live="polite" aria-busy={loading} className="space-y-6">
          {/* ローディング状態 */}
          {loading && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-slate-300 bg-white/95 py-16 text-center" role="status">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-slate-200 border-t-blue-400 animate-spin" />
              <p className="mt-5 text-sm text-slate-500">生徒データを読み込み中です…</p>
            </div>
          )}

          {/* 生徒カード一覧 */}
          {!loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleLoadMore}
                className="rounded-md border border-slate-400 bg-white px-5 py-2 text-sm font-semibold tracking-wide text-slate-800 transition hover:bg-slate-100"
              >
                さらに表示 ({students.length - visibleStudents.length}件)
              </button>
            </div>
          )}

          {/* 結果なし */}
          {!loading && students.length === 0 && (
            <div className="rounded-lg border border-slate-300 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">条件に一致する生徒さんが見つかりませんでした。フィルターを調整して再度お試しください。</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
