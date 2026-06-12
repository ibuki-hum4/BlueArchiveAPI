'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Navigation from '@/components/Navigation';
import StudentCard from '@/components/StudentCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { Button } from '@/components/ui/button';
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
      <header className="ba-soft-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <h1 className="font-rounded text-3xl font-extrabold tracking-tight text-ba-navy-900 sm:text-4xl">
            おかえりなさい、先生！
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-ba-navy-500 sm:text-base">
            豊富なフィルターと並べ替え機能で、目的の生徒さんをすぐに見つけられます。
          </p>
          <p className="mt-4 text-sm text-ba-navy-400" role="status" aria-live="polite">
            現在 {totalCount} 件の生徒さんが条件に一致しています
          </p>
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
            <div className="flex flex-col items-center justify-center rounded-xl border border-ba-blue-100 bg-white py-16 text-center" role="status">
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
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button type="button" onClick={handleLoadMore} className="px-6 font-bold">
                  さらに表示 ({students.length - visibleStudents.length}件)
                </Button>
              </motion.div>
            </div>
          )}

          {/* 結果なし */}
          {!loading && students.length === 0 && (
            <div className="rounded-xl border border-ba-blue-100 bg-white py-16 text-center">
              <p className="text-sm text-ba-navy-400">条件に一致する生徒さんが見つかりませんでした。フィルターを調整して再度お試しください。</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
