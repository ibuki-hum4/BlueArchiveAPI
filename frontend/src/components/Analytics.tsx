"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { pageview } from '@/lib/gtag';

export default function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const sp = searchParams?.toString();
    const url = sp ? `${pathname}?${sp}` : pathname;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}
