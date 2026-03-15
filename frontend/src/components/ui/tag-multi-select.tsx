import React, { useState, useEffect, useRef } from 'react';
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

const EMOJI_OPTIONS = [
  '🎨', '💼', '💖', '🎬', '🔧', '📚', '👗', '🍔', '🎮', '💊',
  '🏛️', '📖', '🎵', '🐾', '📷', '🔬', '⚽', '💻', '✈️', '🌿',
  '💪', '🍳', '💃', '😂', '🎉', '🎤', '🧩', '🎯', '🌍', '🚀',
  '🧠', '🎭', '🔥', '⭐', '🎶', '📝', '🏆', '🎧', '🖥️', '📱',
  '🎪', '🏠', '🌊', '🎸', '🧘', '🍕', '🏃', '🎲', '🌸', '🦄',
  '🐶', '🐱', '🦊', '🐻', '🦁', '🐸', '🎀', '🧪', '💡', '🔑',
  '📌', '🗂️', '🧲', '🪄', '🎃', '❤️', '💎', '🌈', '☕', '🍿',
  '🛒', '🎁', '🧸', '📣', '🔔', '🌟', '🏅', '🧑‍💻', '👨‍🎨', '🧑‍🍳',
];

function isEmoji(str?: string): boolean {
  if (!str) return false;
  return !str.startsWith('http') && str.length <= 4;
}

function TagIcon({ imageUrl }: { imageUrl?: string }) {
  if (!imageUrl) return <span className="opacity-50">#</span>;
  if (isEmoji(imageUrl)) return <span className="text-sm leading-none">{imageUrl}</span>;
  return (
    <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-700">
      <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function TagMultiSelect({ label, value, onChange, error, maxTags = 5, allowCreate = true, isCollapsible = false }: Props) {
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  const [selectedEmoji, setSelectedEmoji] = useState('🎉');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/tags').then((res) => setAllTags(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
      const res = await api.post('/tags', { name: trimmed, imageUrl: selectedEmoji });
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
              <span key={tag.id} className="flex items-center gap-1.5 rounded bg-indigo-50 py-1 px-2 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                <TagIcon imageUrl={tag.imageUrl} />
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
              <TagIcon imageUrl={tag.imageUrl} />
              <span>{tag.name}</span>
            </button>
          );
        })}
      </div>

        {allowCreate && (
          <div className="mt-3 flex items-center gap-2">
            {/* Emoji picker toggle */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setIsEmojiPickerOpen((prev) => !prev)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                title="Choose icon for custom tag"
              >
                {selectedEmoji}
              </button>
              {isEmojiPickerOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500">Choose icon</p>
                  <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto overflow-x-hidden">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setSelectedEmoji(emoji);
                          setIsEmojiPickerOpen(false);
                        }}
                        className={clsx(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-indigo-50 dark:hover:bg-indigo-900/30",
                          selectedEmoji === emoji && "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-900/50"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
