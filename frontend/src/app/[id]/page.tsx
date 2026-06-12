'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import RarityStars from '@/components/RarityStars';
import { Button } from '@/components/ui/button';
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
      case 'S': return 'bg-green-50 text-green-700';
      case 'A': return 'bg-ba-blue-50 text-ba-blue-700';
      case 'B': return 'bg-yellow-50 text-yellow-700';
      case 'C': return 'bg-orange-50 text-orange-700';
      case 'D': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
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
            <Button className="mt-4 font-bold" onClick={() => router.push('/')}>
              ホームに戻る
            </Button>
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
        <Button
          variant="ghost"
          className="mb-6 px-0 text-ba-blue-600 hover:bg-transparent hover:text-ba-blue-800"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Button>

        <div className="overflow-hidden rounded-xl border border-border bg-white">
          {/* ヘッダー部分 */}
          <div className="ba-soft-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-rounded text-3xl font-extrabold text-ba-navy-900">{student.name}</h1>
                  <RarityStars rarity={student.rarity} size="lg" />
                </div>
                <p className="text-sm text-ba-navy-400">{student.school}</p>
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
                    <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
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
                <div className="rounded-lg bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">タイプ</div>
                  <div className="font-bold text-ba-navy-900">{student.role.type}</div>
                </div>
                <div className="rounded-lg bg-ba-navy-50 p-4">
                  <div className="mb-1 text-sm text-ba-navy-400">クラス</div>
                  <div className="font-bold text-ba-navy-900">{student.role.class}</div>
                </div>
                <div className="rounded-lg bg-ba-navy-50 p-4">
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
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">市街地</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.city)}`}>
                    {student.terrainAdaptation.city}
                  </div>
                </div>
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋外</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
                    {student.terrainAdaptation.outdoor}
                  </div>
                </div>
                <div className="rounded-lg border border-ba-blue-100 p-4 text-center">
                  <div className="mb-2 text-sm text-ba-navy-400">屋内</div>
                  <div className={`inline-block rounded-md px-4 py-2 text-lg font-bold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
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
