'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Student } from '@/types/student';
import StudentForm, { StudentFormValues } from '@/components/admin/StudentForm';
import { fetchStudentById, fetchStudents } from '@/lib/api';
import { updateStudent, deleteStudent, AdminAPIError } from '@/lib/admin-api';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [schools, setSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchStudentById(id, { noStore: true }), fetchStudents({ noStore: true })])
      .then(([studentData, allStudents]) => {
        if (cancelled) return;
        if (!studentData) {
          setLoadError('指定された生徒が見つかりません');
          return;
        }
        setStudent(studentData);
        const uniqueSchools = Array.from(new Set(allStudents.map((s) => s.school))).sort((a, b) =>
          a.localeCompare(b, 'ja-JP')
        );
        setSchools(uniqueSchools);
      })
      .catch(() => {
        if (!cancelled) setLoadError('生徒データの読み込みに失敗しました');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (values: StudentFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const rest: Omit<Student, 'id'> = { ...values };
      const updated = await updateStudent(id, rest);
      setStudent(updated);
    } catch (err) {
      setError(err instanceof AdminAPIError ? err.message : '生徒の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    if (!window.confirm(`「${student.name}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      router.replace('/admin/students');
    } catch (err) {
      window.alert(err instanceof AdminAPIError ? err.message : '削除に失敗しました');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-ba-blue-100 bg-white py-16 text-center" role="status">
        <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-[3px] border-ba-blue-100 border-t-ba-blue-500" />
        <p className="mt-4 text-sm text-ba-navy-400">読み込み中...</p>
      </div>
    );
  }

  if (loadError || !student) {
    return (
      <div className="space-y-4">
        <Link href="/admin/students" className="text-sm font-semibold text-ba-blue-600 hover:text-ba-blue-800">
          ← 生徒一覧に戻る
        </Link>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-sm font-semibold text-red-600" role="alert">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/students" className="text-sm font-semibold text-ba-blue-600 hover:text-ba-blue-800">
            ← 生徒一覧に戻る
          </Link>
          <h1 className="font-rounded mt-2 text-2xl font-extrabold text-ba-navy-900">{student.name} を編集</h1>
          <p className="mt-1 text-sm text-ba-navy-400">ID: {student.id}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? '削除中...' : 'この生徒を削除'}
        </button>
      </div>

      <StudentForm
        mode="edit"
        initialValue={student}
        schools={schools}
        submitLabel="更新する"
        submitting={submitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
