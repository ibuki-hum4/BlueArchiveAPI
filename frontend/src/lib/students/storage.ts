import { promises as fs, existsSync } from 'fs';
import path from 'path';
import type { Student } from '@/types/student';

const STUDENTS_FILE_NAME = 'students.json';
const candidateDirectories = [
  // 追加: コンテナでPVCをマウントしている実体
  path.resolve('/app', 'data'),
  // 既存の候補（ワークディレクトリに依存）
  path.join(process.cwd(), 'data'),
  path.join(process.cwd(), '..', 'data'),
  path.join(process.cwd(), '.vercel', 'project', 'data'),
];

export const resolveStudentsFilePath = async (options: { ensureForWrite?: boolean } = {}) => {
  for (const dir of candidateDirectories) {
    const candidate = path.join(dir, STUDENTS_FILE_NAME);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  if (options.ensureForWrite) {
    for (const dir of candidateDirectories) {
      if (existsSync(dir)) {
        return path.join(dir, STUDENTS_FILE_NAME);
      }
    }

    const fallbackDir = candidateDirectories[0];
    await fs.mkdir(fallbackDir, { recursive: true });
    return path.join(fallbackDir, STUDENTS_FILE_NAME);
  }

  return path.join(candidateDirectories[0], STUDENTS_FILE_NAME);
};

export async function readStudentsData(): Promise<Student[]> {
  try {
    const filePath = await resolveStudentsFilePath();
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data) as Student[];
  } catch (error) {
    console.error('Error reading students data:', error);
    return [];
  }
}

export async function writeStudentsData(students: Student[]): Promise<boolean> {
  try {
    const filePath = await resolveStudentsFilePath({ ensureForWrite: true });
    await fs.writeFile(filePath, JSON.stringify(students, null, 4));
    return true;
  } catch (error) {
    console.error('Error writing students data:', error);
    return false;
  }
}
