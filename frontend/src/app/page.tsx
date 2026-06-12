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
      <div className="min-h-screen bg-ba-blue-50/40">
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
    <div className="min-h-screen bg-ba-blue-50/40 text-ba-navy-900">
      <Navigation />

      {/* ヒーローセクション */}
      <header className="ba-hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="font-rounded text-sm font-bold tracking-[0.3em] text-ba-yellow-200">
            SCHALE LIBRARY
          </p>
          <h1 className="font-rounded mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            おかえりなさい、先生！
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
            豊富なフィルターと並べ替え機能で、目的の生徒さんをすぐに見つけられます。
          </p>
          <div
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex h-2 w-2 rounded-full bg-ba-yellow-300" aria-hidden="true" />
            現在 {totalCount} 件の生徒さんが条件に一致しています
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-7xl mx-auto -mt-6 space-y-8 px-4 py-10 sm:-mt-10 sm:px-6 lg:px-8"
      >
        <section id="explore" className="space-y-8">
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-ba-blue-100 bg-white py-16 text-center" role="status">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ba-blue-100 border-t-ba-blue-500 animate-spin" />
              <p className="mt-5 text-sm text-ba-navy-400">生徒データを読み込み中です…</p>
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
                className="rounded-full bg-ba-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ba-blue-600"
              >
                さらに表示 ({students.length - visibleStudents.length}件)
              </button>
            </div>
          )}

          {/* 結果なし */}
          {!loading && students.length === 0 && (
            <div className="rounded-3xl border border-ba-blue-100 bg-white py-16 text-center">
              <p className="text-sm text-ba-navy-400">条件に一致する生徒さんが見つかりませんでした。フィルターを調整して再度お試しください。</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
