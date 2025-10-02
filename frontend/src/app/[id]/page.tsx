'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
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

  // レア度に基づく色設定
  const getRarityColor = (rarity: number): string => {
    switch (rarity) {
      case 3: return 'bg-yellow-400'; // ★3（金）
      case 2: return 'bg-purple-400'; // ★2（紫）
      case 1: return 'bg-blue-400'; // R（青）
      default: return 'bg-gray-400';
    }
  };

  const getRarityText = (rarity: number): string => {
    switch (rarity) {
      case 3: return '★3';
      case 2: return '★2';
      case 1: return '★1';
      default: return 'N';
    }
  };

  // 攻撃タイプの色設定
  const getAttackTypeColor = (attackType: string): string => {
    switch (attackType) {
      case '神秘': return 'text-blue-600 bg-blue-50';
      case '爆発': return 'text-red-600 bg-red-50';
      case '貫通': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 地形適応度の背景色
  const getTerrainColor = (grade: string): string => {
    switch (grade) {
      case 'S': return 'bg-green-500 text-white';
      case 'A': return 'bg-blue-500 text-white';
      case 'B': return 'bg-yellow-500 text-white';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">生徒データを読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">エラーが発生しました</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 戻るボタン */}
        <button
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => router.back()}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* ヘッダー部分 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{student.name}</h1>
                  <div className={`px-3 py-1 rounded text-sm font-bold text-white ${getRarityColor(student.rarity)}`}>
                    {getRarityText(student.rarity)}
                  </div>
                </div>
                <p className="text-blue-100">{student.school}</p>
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="p-6 space-y-6">
            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  基本情報
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">レア度:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium text-white ${getRarityColor(student.rarity)}`}>
                      {getRarityText(student.rarity)} (★{student.rarity})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">学校:</span>
                    <span className="font-medium">{student.school}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  戦闘情報
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">武器タイプ:</span>
                    <span className="font-medium">{student.weapon.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">カバー:</span>
                    <span className="font-medium">{student.weapon.cover ? 'あり' : 'なし'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">攻撃タイプ:</span>
                    <span className={`px-2 py-1 rounded font-medium ${getAttackTypeColor(student.combat.attackType)}`}>
                      {student.combat.attackType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">防御タイプ:</span>
                    <span className="font-medium">{student.combat.defenseType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 役割情報 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                役割・ポジション
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">タイプ</div>
                  <div className="font-semibold">{student.role.type}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">クラス</div>
                  <div className="font-semibold">{student.role.class}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">ポジション</div>
                  <div className="font-semibold">{student.role.position}</div>
                </div>
              </div>
            </div>

            {/* 地形適応 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
                地形適応度
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">市街地</div>
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getTerrainColor(student.terrainAdaptation.city)}`}>
                    {student.terrainAdaptation.city}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">屋外</div>
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
                    {student.terrainAdaptation.outdoor}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">屋内</div>
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
                    {student.terrainAdaptation.indoor}
                  </div>
                </div>
              </div>
            </div>

            {/* ID情報（デバッグ用） */}
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                ID: {student.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}