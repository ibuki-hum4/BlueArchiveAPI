import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

// Safari は select に独自のグラデーション外観を付けるため appearance を消し、矢印を重ねて描く
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative grid items-center">
        <select
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-base text-gray-900 md:text-sm transition-colors focus:outline-none focus:border-ba-blue-500 focus:ring-3 focus:ring-ba-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50',
            className,
            'pr-9'
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 h-4 w-4 text-gray-400"
          aria-hidden="true"
        />
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
