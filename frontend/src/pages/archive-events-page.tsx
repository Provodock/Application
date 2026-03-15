import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { api } from '../utils/api';
import { PublicEvent } from '../types';
import { getDateLocale } from '../utils/locale';
import { Button } from '../components/ui/button';

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function ArchiveEventsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PublicEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<PublicEvent[]>('/events/archive');
      setItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load archived events');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="5" x="2" y="4" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>
            Archived Events
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Past events from the last 7 days.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={load} disabled={busy}>
            <span className="hidden sm:inline">Refresh</span>
            <svg className="sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((e) => (
          <div
            key={e.id}
            onClick={() => navigate(`/events/${e.id}`)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm opacity-80 hover:opacity-100 transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">{e.title}</div>
                  {e.visibility === 'private' && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                      🔒 Private
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">
                  {e.description || '—'}
                </div>
                {e.tags && e.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span key={t.id} className={clsx("flex items-center gap-1 rounded bg-slate-100 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400", t.imageUrl ? "pl-1 pr-1.5" : "px-1.5")}>
                        {t.imageUrl && !t.imageUrl.startsWith('http') ? (
                          <span className="text-xs leading-none">{t.imageUrl}</span>
                        ) : t.imageUrl ? (
                          <img src={t.imageUrl} alt="" className="h-3.5 w-3.5 rounded-sm object-cover shrink-0 grayscale" />
                        ) : (
                          <span className="font-bold opacity-50">#</span>
                        )}
                        <span>{t.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Archived
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="text-slate-400 dark:text-slate-500">When</div>
              <div>{formatDate(e.date)}</div>
              <div className="text-slate-400 dark:text-slate-500">Where</div>
              <div>{e.location}</div>
              <div className="text-slate-400 dark:text-slate-500">People</div>
              <div>
                {e.participantsCount}/{e.capacity >= 999999 ? '∞' : e.capacity}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!busy && items.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-10">No archived events from the past 7 days.</div>
      ) : null}
    </div>
  );
}
