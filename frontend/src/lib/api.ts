import { Student, StudentsResponse } from '@/types/student';

// APIのベースURL（環境変数から取得、デフォルトは内部API）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

/**
 * 全生徒データを取得
 */
export async function fetchStudents(): Promise<Student[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: StudentsResponse = await response.json();
    
    if (data.message !== 'success') {
      throw new Error('API returned error status');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}

/**
 * IDで特定の生徒データを取得
 */
export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    const students = await fetchStudents();
    return students.find(student => student.id === id) || null;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
}

/**
 * 新しい生徒データを送信
 */
export async function createStudent(studentData: Omit<Student, 'id'>): Promise<{ id: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to create student');
    }

    return { id: result.id };
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
}