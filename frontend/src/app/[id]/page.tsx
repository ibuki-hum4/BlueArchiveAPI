'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import RarityStars from '@/components/RarityStars';
import { Student } from '@/types/student';
import { fetchStudentById } from '@/lib/api';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      const loadStudent = async () => {
        try {
          setLoading(true);
          const data = await fetchStudentById(params.id as string);
          if (data) {
            setStudent(data);
          } else {
            setError('指定された生徒が見つかりません');
          }
        } catch (err) {
          console.error('Error loading student:', err);
          setError('生徒データの読み込みに失敗しました');
        } finally {
          setLoading(false);
        }
      };

      loadStudent();
    }
  }, [params.id]);

  // 攻撃タイプの色設定
  const getAttackTypeColor = (attackType: string): string => {
    switch (attackType) {
      case '神秘': return 'text-ba-blue-700 bg-ba-blue-50';
      case '爆発': return 'text-red-600 bg-red-50';
      case '貫通': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 地形適応度の背景色
  const getTerrainColor = (grade: string): string => {
    switch (grade) {
      case 'S': return 'bg-green-500 text-white';
      case 'A': return 'bg-ba-blue-500 text-white';
      case 'B': return 'bg-yellow-500 text-white';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ba-blue-50/40">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-ba-blue-100 border-t-ba-blue-500"></div>
            <p className="mt-4 text-ba-navy-400">生徒データを読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-ba-blue-50/40">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">エラーが発生しました</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              className="mt-4 rounded-full bg-ba-blue-500 px-4 py-2 font-bold text-white hover:bg-ba-blue-600"
              onClick={() => router.push('/')}
            >
              ホームに戻る
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ba-blue-50/40 text-ba-navy-900">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <button
          className="mb-6 flex items-center font-semibold text-ba-blue-600 hover:text-ba-blue-800"
          onClick={() => router.back()}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          {/* ヘッダー部分 */}
          <div className="ba-hero-gradient p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-rounded text-3xl font-extrabold">{student.name}</h1>
                  <RarityStars rarity={student.rarity} size="lg" />
                </div>
                <p className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white/90">
                  {student.school}
                </p>
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="p-6 space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                  基本情報
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">レア度:</span>
                    <RarityStars rarity={student.rarity} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">学校:</span>
                    <span className="font-semibold text-ba-navy-900">{student.school}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                  戦闘情報
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">武器タイプ:</span>
                    <span className="font-semibold text-ba-navy-900">{student.weapon.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">カバー:</span>
                    <span className="font-semibold text-ba-navy-900">{student.weapon.cover ? 'あり' : 'なし'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">攻撃タイプ:</span>
                    <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
                      {student.combat.attackType}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ba-navy-500">防御タイプ:</span>
                    <span className="font-semibold text-ba-navy-900">{student.combat.defenseType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 役割情報 */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                役割・ポジション
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">タイプ</div>
                  <div className="font-bold text-ba-navy-900">{student.role.type}</div>
                </div>
                <div className="rounded-2xl bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">クラス</div>
                  <div className="font-bold text-ba-navy-900">{student.role.class}</div>
                </div>
                <div className="rounded-2xl bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">ポジション</div>
                  <div className="font-bold text-ba-navy-900">{student.role.position}</div>
                </div>
              </div>
            </div>

            {/* 地形適応 */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-ba-navy-900 border-b border-ba-blue-100 pb-2">
                地形適応度
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">市街地</div>
                  <div className={`inline-block rounded-full px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.city)}`}>
                    {student.terrainAdaptation.city}
                  </div>
                </div>
                <div className="rounded-2xl border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋外</div>
                  <div className={`inline-block rounded-full px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
                    {student.terrainAdaptation.outdoor}
                  </div>
                </div>
                <div className="rounded-2xl border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋内</div>
                  <div className={`inline-block rounded-full px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
                    {student.terrainAdaptation.indoor}
                  </div>
                </div>
              </div>
            </div>

            {/* ID情報（デバッグ用） */}
            <div className="border-t border-ba-blue-100 pt-4">
              <div className="text-sm text-ba-navy-400">
                ID: {student.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
