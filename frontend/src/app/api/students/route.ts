import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import type { Student } from '@/types/student';
import { readStudentsData, writeStudentsData } from '@/lib/students/storage';

// レート制限のシンプルな実装
const rateLimit = new Map();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分
  const maxRequests = 100;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const record = rateLimit.get(ip);
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

// GET /api/students - 全生徒データを取得
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // レート制限チェック
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { message: 'error', error: 'Too Many Requests' },
      { status: 429 }
    );
  }

  try {
    const students = await readStudentsData();
    
    return NextResponse.json({
      message: 'success',
      dataAllPage: 1,
      data: students
    });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json(
      { message: 'error', dataAllPage: 0, data: [] },
      { status: 500 }
    );
  }
}

// POST /api/students - 新しい生徒データを追加
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // レート制限チェック
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { status: 'error', message: 'Too Many Requests' },
      { status: 429 }
    );
  }

  try {
  const studentData = await request.json() as Partial<Student>;
    
    // バリデーション（基本的なもの）
    if (!studentData.name || !studentData.school) {
      return NextResponse.json(
        { status: 'error', message: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // IDを生成
    const student: Student = {
      ...studentData,
      id: nanoid(8)
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

    return NextResponse.json({
      status: 'success',
      message: '生徒データを保存しました',
      id: student.id
    });
  } catch (error) {
    console.error('POST /api/students error:', error);
    return NextResponse.json(
      { status: 'error', message: 'サーバー内部エラー' },
      { status: 500 }
    );
  }
}
