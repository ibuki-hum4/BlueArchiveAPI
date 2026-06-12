import { Student } from '@/types/student';

// APIのベースURL（環境変数から取得、デフォルトは内部API）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export class AdminAPIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminAPIError';
    this.status = status;
  }
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok || result.message !== 'success') {
    throw new AdminAPIError(result.error || `HTTP error! status: ${response.status}`, response.status);
  }

  return result as T;
}

/**
 * 管理者ログイン
 */
export async function adminLogin(password: string): Promise<void> {
  await adminRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

/**
 * 管理者ログアウト
 */
export async function adminLogout(): Promise<void> {
  await adminRequest('/admin/logout', { method: 'POST' });
}

/**
 * 管理者セッションの確認
 */
export async function adminCheckSession(): Promise<boolean> {
  const result = await adminRequest<{ authenticated: boolean }>('/admin/session');
  return result.authenticated;
}

/**
 * 生徒データを新規作成
 */
export async function createStudent(data: Omit<Student, 'id'> & { id?: string }): Promise<Student> {
  const result = await adminRequest<{ data: Student }>('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.data;
}

/**
 * 生徒データを更新
 */
export async function updateStudent(id: string, data: Omit<Student, 'id'>): Promise<Student> {
  const result = await adminRequest<{ data: Student }>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.data;
}

/**
 * 生徒データを削除
 */
export async function deleteStudent(id: string): Promise<void> {
  await adminRequest(`/students/${id}`, { method: 'DELETE' });
}
