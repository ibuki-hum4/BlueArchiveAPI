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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">エラーが発生しました</h2>
            <p className="mt-2 text-gray-600">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ブルーアーカイブ生徒データベース
          </h1>
          <p className="text-gray-600">
            ブルーアーカイブの生徒情報を検索・閲覧できます
          </p>
        </div>

        {/* 検索・フィルター */}
        <SearchAndFilter
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          totalCount={totalCount}
          schools={uniqueSchools}
          weaponTypes={uniqueWeaponTypes}
        />

        {/* ローディング状態 */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">生徒データを読み込み中...</p>
          </div>
        )}

        {/* 生徒カード一覧 */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}

        {/* 結果なし */}
        {!loading && students.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">条件に一致する生徒が見つかりませんでした</p>
          </div>
        )}
      </main>
    </div>
  );
}
