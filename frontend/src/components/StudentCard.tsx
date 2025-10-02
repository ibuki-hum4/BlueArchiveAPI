import Link from 'next/link';
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
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
      case '神秘': return 'text-blue-600';
      case '爆発': return 'text-red-600';
      case '貫通': return 'text-yellow-600';
      default: return 'text-gray-600';
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

  return (
    <Link href={`/${student.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 cursor-pointer border border-gray-200">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between mb-3">
          <div className={`px-2 py-1 rounded text-xs font-bold text-white ${getRarityColor(student.rarity)}`}>
            {getRarityText(student.rarity)}
          </div>
          <div className="text-xs text-gray-500">
            {student.weapon.type}
          </div>
        </div>

        {/* 生徒名 */}
        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">
          {student.name}
        </h3>

        {/* 学校 */}
        <p className="text-sm text-gray-600 mb-3">
          {student.school}
        </p>

        {/* 役割・攻撃タイプ */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {student.role.class}
          </span>
          <span className={`text-xs font-medium ${getAttackTypeColor(student.combat.attackType)}`}>
            {student.combat.attackType}
          </span>
        </div>

        {/* 地形適応 */}
        <div className="grid grid-cols-3 gap-1">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">市街地</div>
            <div className={`text-xs px-2 py-1 rounded ${getTerrainColor(student.terrainAdaptation.city)}`}>
              {student.terrainAdaptation.city}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">屋外</div>
            <div className={`text-xs px-2 py-1 rounded ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
              {student.terrainAdaptation.outdoor}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">屋内</div>
            <div className={`text-xs px-2 py-1 rounded ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
              {student.terrainAdaptation.indoor}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}