import { cache } from 'react';
import type { Student } from '@/types/student';
import { readStudentsData } from '@/lib/students/storage';

// generateMetadata とページ本体で同じリクエスト内の読み込みを共有する
export const getStudents = cache(readStudentsData);

export const getStudentById = cache(async (id: string): Promise<Student | null> => {
  const students = await getStudents();
  return students.find((student) => student.id === id) ?? null;
});
