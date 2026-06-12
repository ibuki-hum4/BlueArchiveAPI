import { memo } from 'react';
import Link from 'next/link';
import { Student } from '@/types/student';
import RarityStars from '@/components/RarityStars';

interface StudentCardProps {
  student: Student;
}

const RARITY_ACCENT_CLASSES: Record<number, string> = {
  3: 'ba-card-accent-3',
  2: 'ba-card-accent-2',
  1: 'ba-card-accent-1',
};

function getAttackTypeColor(attackType: string): string {
  switch (attackType) {
    case '神秘': return 'text-ba-blue-600';
    case '爆発': return 'text-red-600';
    case '貫通': return 'text-yellow-600';
    case '分解': return 'text-teal-600';
    default: return 'text-gray-600';
  }
}

function getTerrainColor(grade: string): string {
  switch (grade) {
    case 'S': return 'bg-green-500 text-white';
    case 'A': return 'bg-ba-blue-500 text-white';
    case 'B': return 'bg-yellow-500 text-white';
    case 'C': return 'bg-orange-500 text-white';
    case 'D': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

function StudentCard({ student }: StudentCardProps) {
  const titleId = `student-${student.id}-name`;
  const accentClass = RARITY_ACCENT_CLASSES[student.rarity] ?? 'bg-slate-300';

  return (
    <Link
      href={`/${student.id}`}
      className="group block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ba-blue-300"
      aria-labelledby={titleId}
      aria-label={`${student.name}の詳細ページを開く`}
    >
      <article className="overflow-hidden rounded-3xl border border-ba-blue-100 bg-white shadow-sm transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:ring-2 group-hover:ring-ba-blue-300">
        {/* レア度アクセントバー */}
        <div className={`h-2 w-full ${accentClass}`} />

        <div className="p-5">
          {/* ヘッダー部分 */}
          <div className="mb-3 flex items-center justify-between">
            <RarityStars rarity={student.rarity} />
            <span className="rounded-full bg-ba-blue-50 px-2.5 py-1 text-xs font-semibold text-ba-blue-700">
              {student.weapon.type}
            </span>
          </div>

          {/* 生徒名 */}
          <h3 id={titleId} className="text-lg font-bold leading-tight text-ba-navy-900 line-clamp-2">
            {student.name}
          </h3>

          {/* 学校 */}
          <p className="mt-2 inline-flex items-center rounded-full bg-ba-navy-50 px-2.5 py-1 text-xs font-medium text-ba-navy-600">
            {student.school}
          </p>

          {/* 役割・攻撃タイプ */}
          <div className="mt-4 flex items-center gap-2">
            <span className="rounded-full border border-ba-blue-200 bg-ba-blue-50 px-2.5 py-1 text-xs font-medium text-ba-blue-700">
              {student.role.class}
            </span>
            <span className={`text-xs font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
              {student.combat.attackType}
            </span>
          </div>

          {/* 地形適応 */}
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">市街地</div>
              <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.city)}`}>
                {student.terrainAdaptation.city}
              </div>
            </div>
            <div className="rounded-xl bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">屋外</div>
              <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.outdoor)}`}>
                {student.terrainAdaptation.outdoor}
              </div>
            </div>
            <div className="rounded-xl bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">屋内</div>
              <div className={`mt-1 inline-flex min-w-[2rem] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getTerrainColor(student.terrainAdaptation.indoor)}`}>
                {student.terrainAdaptation.indoor}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default memo(StudentCard);
