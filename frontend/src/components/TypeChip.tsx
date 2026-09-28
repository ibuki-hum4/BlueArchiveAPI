import { cn } from '@/lib/utils';

interface TypeChipProps {
  label: string;
  /** student-style.ts の *DotClass で得た色 */
  dotClass: string;
}

export default function TypeChip({ label, dotClass }: TypeChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
      <span className={cn('h-2 w-2 rounded-full', dotClass)} aria-hidden="true" />
      {label}
    </span>
  );
}
