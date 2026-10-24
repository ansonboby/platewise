import { clsx } from 'clsx';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
}

export function Input({ label, error, helper, icon, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400 group-focus-within:text-forest-600 transition-colors">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full border rounded-xl py-2 text-sm text-stone-800 placeholder-stone-400',
            'bg-white/90 hover:bg-white focus:bg-white',
            'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600',
            'transition-all duration-150',
            error ? 'border-red-300 bg-red-50/50' : 'border-stone-200/90 hover:border-stone-300',
            icon ? 'pl-9 pr-3' : 'px-3',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {!error && helper && <p className="text-[11px] text-stone-400">{helper}</p>}
    </div>
  );
}
