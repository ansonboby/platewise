import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-forest-50 text-forest-800 border border-forest-200/80 shadow-[0_1px_2px_rgba(27,122,75,0.06)]',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-[0_1px_2px_rgba(16,185,129,0.06)]',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-[0_1px_2px_rgba(245,158,11,0.06)]',
  danger:  'bg-red-50 text-red-800 border border-red-200/80 shadow-[0_1px_2px_rgba(239,68,68,0.06)]',
  info:    'bg-sky-50 text-sky-800 border border-sky-200/80 shadow-[0_1px_2px_rgba(14,165,233,0.06)]',
  muted:   'bg-stone-100/80 text-stone-600 border border-stone-200/60',
};

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full tracking-tight transition-all',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
