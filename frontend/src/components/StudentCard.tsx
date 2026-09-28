'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Student } from '@/types/student';
import RarityStars from '@/components/RarityStars';
import TypeChip from '@/components/TypeChip';
import { attackDotClass, defenseDotClass, terrainGradeClass } from '@/lib/student-style';
import { cn } from '@/lib/utils';

interface StudentCardProps {
  student: Student;
  /** falseの場合は登場アニメーションを行わない（SSRで出力する初期表示分は最初から見せる） */
  animateIn?: boolean;
}

const TERRAINS = [
  { key: 'city', label: '市街地' },
  { key: 'outdoor', label: '屋外' },
  { key: 'indoor', label: '屋内' },
] as const;

function StudentCard({ student, animateIn = true }: StudentCardProps) {
  const titleId = `student-${student.id}-name`;

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link
        href={`/${student.id}`}
        className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ba-blue-500 focus-visible:ring-offset-2"
        aria-labelledby={titleId}
      >
        <article className="ba-panel flex h-full flex-col p-5 transition-[border-color,box-shadow] duration-200 group-hover:border-gray-300 group-hover:shadow-[0_4px_16px_-6px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <RarityStars rarity={student.rarity} size="sm" />
            <span className="ba-skew px-2.5 py-0.5 text-[11px] font-semibold italic tracking-wide text-white">{student.weapon.type}</span>
          </div>

          <h3 id={titleId} className="mt-3 text-base font-semibold leading-snug text-gray-900 line-clamp-2">
            {student.name}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {student.school} · {student.role.class}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <TypeChip label={student.combat.attackType} dotClass={attackDotClass(student.combat.attackType)} />
            <TypeChip label={student.combat.defenseType} dotClass={defenseDotClass(student.combat.defenseType)} />
          </div>

          {/* 地形適応 */}
          <div className="mt-auto pt-4">
            <dl className="grid grid-cols-3 border-t border-gray-100 pt-3">
              {TERRAINS.map(({ key, label }) => (
                <div key={key} className="text-center">
                  <dt className="text-[10px] text-gray-400">{label}</dt>
                  <dd className={cn('text-sm font-semibold', terrainGradeClass(student.terrainAdaptation[key]))}>
                    {student.terrainAdaptation[key]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

export default memo(StudentCard);
