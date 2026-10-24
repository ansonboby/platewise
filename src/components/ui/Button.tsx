import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-b from-forest-600 via-forest-600 to-forest-700 hover:from-forest-500 hover:to-forest-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_16px_rgba(27,122,75,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] ring-1 ring-inset ring-white/20 active:shadow-inner',
  secondary:
    'bg-white border border-stone-200/90 hover:bg-stone-50/90 text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:border-stone-300',
  ghost:
    'hover:bg-stone-100/80 text-stone-600 hover:text-stone-900',
  danger:
    'bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_14px_rgba(220,38,38,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-inset ring-white/20',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-160 ease-[cubic-bezier(0.23,1,0.32,1)]',
        'active:scale-[0.97] focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
