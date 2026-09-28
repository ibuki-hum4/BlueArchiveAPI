import StudentExplorer from '@/components/StudentExplorer';
import { getStudents } from '@/lib/students/server';

// 生徒データはPVCで実行時にマウントされるため、リクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

export default async function Home() {
  const students = await getStudents();

  // サーバーで読めなかった場合はクライアント側でAPIから取得する
  return <StudentExplorer initialStudents={students.length > 0 ? students : undefined} />;
}
