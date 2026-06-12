'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentForm, { StudentFormValues } from '@/components/admin/StudentForm';
import { createStudent, AdminAPIError } from '@/lib/admin-api';
import { fetchStudents } from '@/lib/api';

export default function NewStudentPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStudents({ noStore: true })
      .then((students) => {
        const uniqueSchools = Array.from(new Set(students.map((s) => s.school))).sort((a, b) =>
          a.localeCompare(b, 'ja-JP')
        );
        setSchools(uniqueSchools);
      })
      .catch(() => {
        // 学校候補の取得に失敗してもフォーム自体は利用できる
      });
  }, []);

  const handleSubmit = async (values: StudentFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const { id, ...rest } = values;
      const created = await createStudent({ ...rest, id: id.trim() || undefined });
      router.replace(`/admin/students/${created.id}`);
    } catch (err) {
      setError(err instanceof AdminAPIError ? err.message : '生徒の作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/students" className="text-sm font-semibold text-ba-blue-600 hover:text-ba-blue-800">
          ← 生徒一覧に戻る
        </Link>
        <h1 className="font-rounded mt-2 text-2xl font-extrabold text-ba-navy-900">新規生徒を追加</h1>
      </div>

      <StudentForm mode="create" schools={schools} submitLabel="作成する" submitting={submitting} error={error} onSubmit={handleSubmit} />
    </div>
  );
}
