import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const widthClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-md p-4 transition-opacity duration-200 animate-in fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={clsx(
          'bg-stone-100/70 p-1.5 rounded-[1.75rem] ring-1 ring-stone-900/10 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] w-full flex flex-col max-h-[90vh] overflow-hidden',
          'transform transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in zoom-in-95',
          widthClass,
        )}
      >
        <div className="bg-white rounded-[calc(1.75rem-0.375rem)] flex flex-col flex-1 overflow-hidden border border-stone-100/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-stone-100 bg-stone-50/50">
            <div>
              <h2 className="text-base font-bold font-display text-stone-900 tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 rounded-md border border-stone-200">
                ESC
              </kbd>
              <Button variant="ghost" size="sm" onClick={onClose} className="!p-1.5 rounded-lg text-stone-400 hover:text-stone-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="px-6 py-5 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
