'use client';

import { useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import StudentCard from '@/components/StudentCard';
import SearchAndFilter from '@/components/SearchAndFilter';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/hooks/useStudents';
import type { Student } from '@/types/student';

const INITIAL_VISIBLE_COUNT = 24;
const LOAD_MORE_COUNT = 24;

interface StudentExplorerProps {
  initialStudents?: Student[];
}

export default function StudentExplorer({ initialStudents }: StudentExplorerProps) {
  const {
    students,
    totalCount,
    allStudents,
    uniqueSchools,
    uniqueWeaponTypes,
    loading,
    error,
    handleFilterChange,
    handleSortChange,
  } = useStudents(initialStudents);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [prevStudents, setPrevStudents] = useState(students);
  if (students !== prevStudents) {
    setPrevStudents(students);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }
  const visibleStudents = useMemo(
    () => students.slice(0, visibleCount),
    [students, visibleCount]
  );

  const hasMore = students.length > visibleStudents.length;
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
  };

  return (
    <>
      <PageHeader
        title="生徒一覧"
        description={
          !loading && !error
            ? `${allStudents.length}人の生徒、${uniqueSchools.length}校のデータを収録しています。`
            : 'ブルーアーカイブの生徒データを検索・閲覧できます。'
        }
      />

      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="ba-panel py-16 text-center" role="alert">
            <h2 className="text-base font-semibold text-gray-900">エラーが発生しました</h2>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            <section id="explore">
              <SearchAndFilter
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                totalCount={totalCount}
                schools={uniqueSchools}
                weaponTypes={uniqueWeaponTypes}
              />
            </section>

            <section aria-live="polite" aria-busy={loading} className="space-y-6">
              <h2 className="sr-only">生徒一覧</h2>

              {loading && (
                <div className="ba-panel flex flex-col items-center justify-center py-16 text-center" role="status">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                  <p className="mt-4 text-sm text-gray-500">読み込み中…</p>
                </div>
              )}

              {!loading && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleStudents.map((student, index) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      animateIn={index >= INITIAL_VISIBLE_COUNT}
                    />
                  ))}
                </div>
              )}

              {!loading && hasMore && (
                <div className="flex justify-center pt-2">
                  <Button type="button" variant="outline" onClick={handleLoadMore} className="px-6">
                    さらに表示（残り {students.length - visibleStudents.length} 人）
                  </Button>
                </div>
              )}

              {!loading && students.length === 0 && (
                <div className="ba-panel py-16 text-center">
                  <p className="text-sm text-gray-500">
                    条件に一致する生徒さんが見つかりませんでした。フィルターを調整して再度お試しください。
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}
