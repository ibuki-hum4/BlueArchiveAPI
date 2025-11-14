'use client';

import Navigation from '@/components/Navigation';
import StudentCard from '@/components/StudentCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { useStudents } from '@/hooks/useStudents';

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

  // Debug: log totalCount and visible students length on each render
  // eslint-disable-next-line no-console
  console.debug('[Home] totalCount:', totalCount, 'students.length:', students.length);

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
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12"
      >
        <section id="explore" className="space-y-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">生徒を素早く探す</h2>
              <p className="text-sm text-slate-500">
                豊富なフィルターと並べ替え機能で目的の生徒をすぐに見つけられます。
              </p>
            </div>
            <div className="text-sm text-slate-500" role="status" aria-live="polite">
              現在 {totalCount} 件の生徒が条件に一致しています
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
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center" role="status">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-slate-200 border-t-blue-400 animate-spin" />
              <p className="mt-5 text-sm text-slate-500">生徒データを読み込み中です…</p>
            </div>
          )}

          {/* 生徒カード一覧 */}
          {!loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}

          {/* 結果なし */}
          {!loading && students.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
              <p className="text-sm text-slate-500">条件に一致する生徒が見つかりませんでした。フィルターを調整して再度お試しください。</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
