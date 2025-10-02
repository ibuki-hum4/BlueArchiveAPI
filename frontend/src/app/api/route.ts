import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'ブルーアーカイブAPIサーバー稼働中（Next.js版）',
    timestamp: new Date().toISOString(),
    endpoints: {
      students: '/api/students'
    }
  });
}
