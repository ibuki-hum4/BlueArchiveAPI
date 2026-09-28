import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const WIDTH_CLASSES = {
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
} as const;

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** 本文のコンテナ幅に合わせる */
  width?: keyof typeof WIDTH_CLASSES;
  children?: ReactNode;
}

export default function PageHeader({ title, description, width = 'xl', children }: PageHeaderProps) {
  return (
    <header className={cn('mx-auto px-4 pt-10 pb-2 sm:px-6 sm:pt-14 lg:px-8', WIDTH_CLASSES[width])}>
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-[15px] text-gray-500">{description}</p>}
      {children}
    </header>
  );
}
