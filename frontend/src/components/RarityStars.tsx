interface RarityStarsProps {
  rarity: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export default function RarityStars({ rarity, size = 'md', className = '' }: RarityStarsProps) {
  const sizeClass = SIZE_CLASSES[size];
  const count = Math.max(1, Math.min(rarity, 3));

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-amber-400 ${className}`}
      role="img"
      aria-label={`レア度 ★${rarity}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <svg key={index} viewBox="0 0 20 20" fill="currentColor" className={sizeClass} aria-hidden="true">
          <path d="M10 1.5l2.59 5.25 5.79.84-4.19 4.08.99 5.77L10 14.77l-5.18 2.67.99-5.77L1.62 7.59l5.79-.84L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
