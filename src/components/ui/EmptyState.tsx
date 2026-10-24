import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-stone-100 text-stone-400">{icon}</div>
      )}
      <h3 className="text-base font-semibold text-stone-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-stone-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
