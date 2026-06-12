import { Student, StudentsResponse } from '@/types/student';

// APIのベースURL（環境変数から取得、デフォルトは内部API）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

interface FetchOptions {
  /** trueの場合、ブラウザのHTTPキャッシュを使わず常に最新データを取得する */
  noStore?: boolean;
}

/**
 * 全生徒データを取得
 */
export async function fetchStudents(options?: FetchOptions): Promise<Student[]> {
  try {
    const url = new URL(`${API_BASE_URL}/students`, typeof window === 'undefined' ? 'http://localhost' : window.location.href);
    // 開発時やクライアントでのフィルターで取りこぼしが起きないよう、デフォルトで大きめの limit を指定
    if (!url.searchParams.has('limit')) {
      url.searchParams.set('limit', '1000');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 通常はAPIのCache-Control/ETagに基づくHTTPキャッシュを利用する
      cache: options?.noStore ? 'no-store' : 'default',
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
export async function fetchStudentById(id: string, options?: FetchOptions): Promise<Student | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: options?.noStore ? 'no-store' : 'default',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.message !== 'success') {
      throw new Error(result.error || 'Failed to fetch student');
    }

    return result.data as Student;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
}