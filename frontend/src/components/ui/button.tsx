import clsx from 'clsx';
import * as React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500',
  secondary:
    'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 disabled:text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:text-slate-500',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-500',
};

export function Button({
  className,
  variant = 'primary',
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-300',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

