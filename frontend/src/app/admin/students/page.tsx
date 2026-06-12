'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Student } from '@/types/student';
import { fetchStudents } from '@/lib/api';
import { deleteStudent, AdminAPIError } from '@/lib/admin-api';
import RarityStars from '@/components/RarityStars';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudents({ noStore: true });
      setStudents(data);
    } catch {
      setError('生徒データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(keyword) || student.school.toLowerCase().includes(keyword)
    );
  }, [students, search]);

  const handleDelete = async (student: Student) => {
    if (!window.confirm(`「${student.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    setDeletingId(student.id);
    try {
      await deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
    } catch (err) {
      const message = err instanceof AdminAPIError ? err.message : '削除に失敗しました';
      window.alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-rounded text-2xl font-extrabold text-ba-navy-900">生徒管理</h1>
          <p className="mt-1 text-sm text-ba-navy-400">{students.length}件の生徒データ</p>
        </div>
        <Button asChild className="font-bold">
          <Link href="/admin/students/new">+ 新規生徒を追加</Link>
        </Button>
      </div>

      <div className="rounded-xl border border-ba-blue-100 bg-white p-4">
        <Input
          type="text"
          placeholder="生徒名・学校名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-ba-blue-100 bg-white py-16 text-center" role="status">
          <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-[3px] border-ba-blue-100 border-t-ba-blue-500" />
          <p className="mt-4 text-sm text-ba-navy-400">読み込み中...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-ba-blue-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-ba-navy-50 text-xs font-semibold uppercase tracking-wide text-ba-navy-500">
              <tr>
                <th className="px-4 py-3">レア度</th>
                <th className="px-4 py-3">名前</th>
                <th className="px-4 py-3">学校</th>
                <th className="px-4 py-3">武器</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ba-blue-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-ba-blue-50/40">
                  <td className="px-4 py-3">
                    <RarityStars rarity={student.rarity} size="sm" />
                  </td>
                  <td className="px-4 py-3 font-semibold text-ba-navy-900">{student.name}</td>
                  <td className="px-4 py-3 text-ba-navy-500">{student.school}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-ba-blue-50 px-2.5 py-1 text-xs font-semibold text-ba-blue-700">
                      {student.weapon.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="secondary" className="border border-ba-blue-200">
                        <Link href={`/admin/students/${student.id}`}>編集</Link>
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(student)}
                        disabled={deletingId === student.id}
                      >
                        {deletingId === student.id ? '削除中...' : '削除'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredStudents.length === 0 && (
            <p className="py-12 text-center text-sm text-ba-navy-400">該当する生徒が見つかりませんでした。</p>
          )}
        </div>
      )}
    </div>
  );
}
