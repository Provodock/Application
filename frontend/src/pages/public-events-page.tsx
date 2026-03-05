import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { PublicEvent } from '../types';
import { useAuthStore } from '../stores/auth-store';

type ViewMode = 'list' | 'calendar';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatDayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function PublicEventsPage() {
  const token = useAuthStore((s) => s.token);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [items, setItems] = useState<PublicEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    [items],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PublicEvent[]>();
    for (const ev of sorted) {
      const key = formatDayKey(ev.date);
      map.set(key, [...(map.get(key) || []), ev]);
    }
    return map;
  }, [sorted]);

  const monthMatrix = useMemo(() => {
    if (viewMode !== 'calendar') return [];
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7;
    const startDate = new Date(firstOfMonth);
    startDate.setDate(firstOfMonth.getDate() - startDay);

    const weeks: Date[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + w * 7 + d);
        week.push(day);
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentDate, viewMode]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function eventsForDay(day: Date) {
    const key = formatDayKey(day.toISOString());
    return (eventsByDay.get(key) || []).slice().sort((a, b) => {
      return +new Date(a.date) - +new Date(b.date);
    });
  }

  const calendarTitle = useMemo(() => {
    return currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<PublicEvent[]>('/events');
      setItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load events');
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Public events</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse events and join if you are logged in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                viewMode === 'calendar'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Calendar
            </button>
          </div>
          {viewMode === 'calendar' && (
            <>
              <Button variant="secondary" onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}>
                ‹
              </Button>
              <span className="min-w-[160px] text-center text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {calendarTitle}
              </span>
              <Button variant="secondary" onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}>
                ›
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={load} disabled={busy}>
            Refresh
          </Button>
          {token ? (
            <Link
              to="/events/new"
              className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Create event
            </Link>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {viewMode === 'list' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((e) => (
              <Link
                key={e.id}
                to={`/events/${e.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">{e.title}</div>
                    <div className="mt-1 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">
                      {e.description || '—'}
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      e.isFull
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                    }`}
                  >
                    {e.isFull ? 'Full' : 'Open'}
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
              </Link>
            ))}
          </div>
          {!busy && sorted.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">No events yet.</div>
          ) : null}
        </>
      )}

      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="grid grid-cols-7 overflow-hidden rounded-t-xl text-sm">
            {weekDays.map((d) => (
              <div
                key={d}
                className="flex min-h-[44px] min-w-0 items-center justify-center border border-slate-200 bg-slate-100 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-300"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-b-xl text-sm">
            {monthMatrix.map((week, wi) =>
              week.map((day, di) => {
                const dayEvents = eventsForDay(day);
                const isToday =
                  formatDayKey(day.toISOString()) === formatDayKey(new Date().toISOString());
                const inCurrentMonth = day.getMonth() === currentDate.getMonth();
                return (
                  <div
                    key={`${wi}-${di}`}
                    className={`flex min-h-[112px] min-w-0 flex-col border border-slate-200 p-2 dark:border-slate-500 ${
                      inCurrentMonth
                        ? 'bg-indigo-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        : 'bg-white text-slate-400 dark:bg-slate-900 dark:text-slate-500'
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div
                        className={`h-6 w-6 rounded-full text-center text-xs leading-6 ${
                          isToday
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to={`/events/${ev.id}`}
                          className="block rounded-md bg-indigo-50 px-2 py-1 text-[11px] text-indigo-900 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
                        >
                          <div className="font-semibold truncate">{ev.title}</div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400">
                            {formatTime(ev.date)} · {ev.location}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }),
            )}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && !busy && sorted.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">No events yet.</div>
      ) : null}
    </div>
  );
}

