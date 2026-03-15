import clsx from 'clsx';
import * as React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <div className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">{label}</div>
      ) : null}
      <input
        className={clsx(
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400',
          error && 'border-rose-600 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500',
          className,
        )}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-rose-400">{error}</div> : null}
    </label>
  );
}

