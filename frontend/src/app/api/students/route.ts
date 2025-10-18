import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import type { Student } from '@/types/student';
import { readStudentsData, writeStudentsData } from '@/lib/students/storage';

// レート制限のシンプルな実装
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分
  const maxRequests = 100;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimit.get(ip)!;
  if (now > record.resetTime) {
    // ウィンドウをリセット
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// シンプルな in-memory キャッシュ
let studentsCache: { ts: number; data: Student[] } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60秒

async function getCachedStudents(): Promise<Student[]> {
  const now = Date.now();
  if (studentsCache && now - studentsCache.ts < CACHE_TTL_MS) {
    return studentsCache.data;
  }

  const data = await readStudentsData();
  studentsCache = { ts: now, data };
  return data;
}

function invalidateStudentsCache() {
  studentsCache = null;
}

// GET /api/students - 全生徒データを取得 (filter, pagination, cache)
export async function GET(request: NextRequest) {
  const ip =
    (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) ?? 'unknown';

  // レート制限チェック
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'error', error: 'Too Many Requests' },
      { status: 429 }
    );
  }

  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    // クエリパラメータ
    const limitParam = params.get('limit');
    const pageParam = params.get('page');
    const school = params.get('school');
    const rarityParam = params.get('rarity');

    const limit = Math.max(1, Math.min(1000, Number(limitParam ?? 100)));
    const page = Math.max(1, Number(pageParam ?? 1));
    const rarity = rarityParam ? Number(rarityParam) : undefined;

    // データ取得（キャッシュ経由）
    const allStudents = await getCachedStudents();

    // フィルタ
    let filtered = allStudents;
    if (school) {
      filtered = filtered.filter((s) => s.school === school);
    }
    if (rarity !== undefined && !Number.isNaN(rarity)) {
      filtered = filtered.filter((s) => s.rarity === rarity);
    }

    const total = filtered.length;

    // ページネーション (1-indexed page)
    const start = (page - 1) * limit;
    const end = start + limit;
    const pageData = filtered.slice(start, end);

    const headers = {
      'Cache-Control': `public, max-age=${Math.floor(CACHE_TTL_MS / 1000)}`,
    };

    return NextResponse.json(
      {
        message: 'success',
        total,
        count: pageData.length,
        data: pageData,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json(
      { message: 'error', total: 0, count: 0, data: [] },
      { status: 500 }
    );
  }
}

// POST /api/students - 新しい生徒データを追加
export async function POST(request: NextRequest) {
  const ip =
    (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')) ?? 'unknown';

  // レート制限チェック
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { status: 'error', message: 'Too Many Requests' },
      { status: 429 }
    );
  }

  try {
    const studentData = (await request.json()) as Partial<Student>;

    // バリデーション（基本的なもの）
    if (!studentData.name || !studentData.school) {
      return NextResponse.json(
        { status: 'error', message: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // IDを生成
    const student: Student = {
      ...(studentData as Student),
      id: nanoid(8),
    } as Student;

    // 既存データを読み込み
    const students = await readStudentsData();

    // 新しい生徒を追加
    students.push(student);

    // データを保存
    const success = await writeStudentsData(students);

    if (!success) {
      return NextResponse.json(
        { status: 'error', message: '生徒データの保存に失敗しました' },
        { status: 500 }
      );
    }

    // キャッシュを無効化
    invalidateStudentsCache();

    return NextResponse.json({ status: 'success', message: '生徒データを保存しました', id: student.id });
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json(
      { status: 'error', message: 'サーバー内部エラー' },
      { status: 500 }
    );
  }
}
