import { clsx } from 'clsx';
import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, helper, options, className, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={clsx(
            'w-full border rounded-xl py-2 px-3 text-sm text-stone-800 appearance-none pr-8',
            'bg-white/90 hover:bg-white focus:bg-white',
            'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
            'focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-600',
            'transition-all duration-150 cursor-pointer',
            error ? 'border-red-300 bg-red-50/50' : 'border-stone-200/90 hover:border-stone-300',
            className,
          )}
          {...props}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {!error && helper && <p className="text-[11px] text-stone-400">{helper}</p>}
    </div>
  );
}
