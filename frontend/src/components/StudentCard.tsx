import Link from 'next/link';
import { Student } from '@/types/student';

interface StudentCardProps {
  student: Student;
}

export default function StudentCard({ student }: StudentCardProps) {
  const titleId = `student-${student.id}-name`;
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
      case '分解': return 'text-teal-600';
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
    <Link
      href={`/${student.id}`}
      className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded-3xl"
      aria-labelledby={titleId}
      aria-label={`${student.name}の詳細ページを開く`}
    >
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:border-blue-200 group-hover:shadow-lg">
        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between mb-4">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ${getRarityColor(student.rarity)}`}>
            {getRarityText(student.rarity)}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {student.weapon.type}
          </span>
        </div>

        {/* 生徒名 */}
        <h3 id={titleId} className="text-lg font-semibold leading-tight text-slate-900 line-clamp-2">
          {student.name}
        </h3>

        {/* 学校 */}
        <p className="mt-2 text-sm text-slate-500">
          {student.school}
        </p>

        {/* 役割・攻撃タイプ */}
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {student.role.class}
          </span>
          <span className={`text-xs font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
            {student.combat.attackType}
          </span>
        </div>

        {/* 地形適応 */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 py-2 text-center">
            <div className="text-xs text-slate-500">市街地</div>
            <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-3 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.city)}`}>
              {student.terrainAdaptation.city}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 py-2 text-center">
            <div className="text-xs text-slate-500">屋外</div>
            <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-3 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
              {student.terrainAdaptation.outdoor}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 py-2 text-center">
            <div className="text-xs text-slate-500">屋内</div>
            <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-3 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
              {student.terrainAdaptation.indoor}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}