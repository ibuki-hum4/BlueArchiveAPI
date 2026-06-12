'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Student } from '@/types/student';
import RarityStars from '@/components/RarityStars';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
}

function getAttackTypeColor(attackType: string): string {
  switch (attackType) {
    case '神秘': return 'text-ba-blue-600';
    case '爆発': return 'text-red-600';
    case '貫通': return 'text-yellow-600';
    case '分解': return 'text-teal-600';
    default: return 'text-gray-600';
  }
}

function getTerrainBadgeClass(grade: string): string {
  switch (grade) {
    case 'S': return 'border-transparent bg-green-50 text-green-700';
    case 'A': return 'border-transparent bg-ba-blue-50 text-ba-blue-700';
    case 'B': return 'border-transparent bg-yellow-50 text-yellow-700';
    case 'C': return 'border-transparent bg-orange-50 text-orange-700';
    case 'D': return 'border-transparent bg-red-50 text-red-700';
    default: return 'border-transparent bg-gray-100 text-gray-600';
  }
}

function StudentCard({ student }: StudentCardProps) {
  const titleId = `student-${student.id}-name`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={`/${student.id}`}
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-labelledby={titleId}
        aria-label={`${student.name}の詳細ページを開く`}
      >
        <Card className="p-5 transition-colors duration-200 hover:border-ba-blue-300 hover:shadow-md">
          {/* ヘッダー部分 */}
          <div className="mb-2 flex items-center justify-between">
            <RarityStars rarity={student.rarity} />
            <span className="text-xs font-semibold text-ba-navy-400">{student.weapon.type}</span>
          </div>

          {/* 生徒名 */}
          <h3 id={titleId} className="text-lg font-bold leading-tight text-ba-navy-900 line-clamp-2">
            {student.name}
          </h3>

          {/* 学校 */}
          <p className="mt-1 text-sm text-ba-navy-400">{student.school}</p>

          {/* 役割・攻撃タイプ */}
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="outline" className="border-ba-blue-200 bg-ba-blue-50 font-medium text-ba-blue-700">
              {student.role.class}
            </Badge>
            <span className={`text-xs font-semibold ${getAttackTypeColor(student.combat.attackType)}`}>
              {student.combat.attackType}
            </span>
          </div>

          {/* 地形適応 */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">市街地</div>
              <Badge className={cn('mt-1 min-w-[2rem] justify-center', getTerrainBadgeClass(student.terrainAdaptation.city))}>
                {student.terrainAdaptation.city}
              </Badge>
            </div>
            <div className="rounded-lg bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">屋外</div>
              <Badge className={cn('mt-1 min-w-[2rem] justify-center', getTerrainBadgeClass(student.terrainAdaptation.outdoor))}>
                {student.terrainAdaptation.outdoor}
              </Badge>
            </div>
            <div className="rounded-lg bg-ba-navy-50 py-2 text-center">
              <div className="text-xs text-ba-navy-400">屋内</div>
              <Badge className={cn('mt-1 min-w-[2rem] justify-center', getTerrainBadgeClass(student.terrainAdaptation.indoor))}>
                {student.terrainAdaptation.indoor}
              </Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default memo(StudentCard);
