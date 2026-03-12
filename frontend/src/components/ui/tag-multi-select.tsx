import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { api } from '../../utils/api';

export type TagType = { id: string; name: string; imageUrl?: string };

type Props = {
  label?: string;
  value: TagType[];
  onChange: (tags: TagType[]) => void;
  error?: string;
  maxTags?: number;
  allowCreate?: boolean;
  isCollapsible?: boolean;
};

export function TagMultiSelect({ label, value, onChange, error, maxTags = 5, allowCreate = true, isCollapsible = false }: Props) {
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  useEffect(() => {
    api.get('/tags').then((res) => setAllTags(res.data)).catch(console.error);
  }, []);

  const toggleTag = (tag: TagType) => {
    const isSelected = value.some((t) => t.id === tag.id);
    if (isSelected) {
      onChange(value.filter((t) => t.id !== tag.id));
    } else {
      if (value.length >= maxTags) return;
      onChange([...value, tag]);
    }
  };

  const handleCreate = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || value.length >= maxTags) return;
    
    const existing = allTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!value.some((t) => t.id === existing.id)) {
        onChange([...value, existing]);
      }
      setInputValue('');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post('/tags', { name: trimmed });
      const newTag = res.data;
      setAllTags((prev) => [...prev, newTag]);
      onChange([...value, newTag]);
      setInputValue('');
    } catch (e) {
      console.error('Failed to create tag', e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="block">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {label}
          </label>
          <div className="flex items-center gap-3">
            <span className={clsx("text-xs font-semibold", value.length === maxTags ? "text-amber-500" : "text-slate-500")}>
              {value.length}/{maxTags} selected
            </span>
            {isCollapsible && !isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="rounded text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {value.length === 0 ? '+ Add tags' : 'Edit tags'}
              </button>
            )}
          </div>
        </div>
      ) : null}

      {isCollapsible && !isExpanded ? (
        // Collapsed View
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.length === 0 ? (
            <span className="text-sm text-slate-500 italic dark:text-slate-400">No tags selected</span>
          ) : (
            value.map((tag) => (
              <span key={tag.id} className="flex items-center gap-1.5 rounded bg-indigo-50 py-1 pr-2 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                {tag.imageUrl ? (
                  <img src={tag.imageUrl} alt="" className="ml-1 h-4 w-4 rounded-sm object-cover shrink-0" />
                ) : (
                  <span className="ml-2 font-bold opacity-50">#</span>
                )}
                <span>{tag.name}</span>
              </span>
            ))
          )}
        </div>
      ) : (
        // Expanded View
        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tags..."
          className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
        />
      </div>

      <div
        className={clsx(
          'flex flex-wrap gap-2 rounded-xl border bg-slate-50 p-2.5 dark:bg-slate-800/50',
          error ? 'border-rose-600 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
        )}
      >
        {allTags
          .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((tag) => {
          const isSelected = value.some((t) => t.id === tag.id);
          const isDisabled = !isSelected && value.length >= maxTags;
          
          return (
            <button
              key={tag.id}
              type="button"
              disabled={isDisabled}
              onClick={() => toggleTag(tag)}
              className={clsx(
                "group relative flex shrink-0 items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                isSelected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-[0_0_0_1px_rgba(99,102,241,1)] dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-200 dark:shadow-[0_0_0_1px_rgba(129,140,248,1)]"
                  : isDisabled
                  ? "cursor-not-allowed border-slate-200 bg-white/50 text-slate-400 opacity-60 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500"
                  : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-600/50 dark:hover:bg-slate-700/50"
              )}
            >
              {tag.imageUrl && (
                <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
                  <img src={tag.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
              )}
              {!tag.imageUrl && <span className="opacity-50">#</span>}
              <span>{tag.name}</span>
            </button>
          );
        })}
      </div>

        {allowCreate && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={value.length >= maxTags}
              className={clsx(
                "h-9 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100",
                value.length >= maxTags && "cursor-not-allowed opacity-60"
              )}
              placeholder={value.length >= maxTags ? "Limit reached" : "Enter a custom tag name..."}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={!inputValue.trim() || isCreating || value.length >= maxTags}
              className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {isCreating ? 'Adding...' : 'Add custom'}
            </button>
          </div>
        )}

        {isCollapsible && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-lg bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Done
            </button>
          </div>
        )}
      </div>
      )}

      {error ? <div className="mt-1.5 text-xs font-medium text-rose-500 dark:text-rose-400">{error}</div> : null}
    </div>
  );
}
