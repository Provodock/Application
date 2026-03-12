import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { TagMultiSelect, TagType } from '../components/ui/tag-multi-select';
import { PublicEvent } from '../types';
import { useAuthStore } from '../stores/auth-store';
import { getDateLocale } from '../utils/locale';

type ViewMode = 'list' | 'calendar';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(getDateLocale(), { dateStyle: 'medium', timeStyle: 'short' });
}

function formatDayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(getDateLocale(), { hour: '2-digit', minute: '2-digit' });
}

export function PublicEventsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [items, setItems] = useState<PublicEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const tagFilterId = searchParams.get('tag');

  useEffect(() => {
    if (tagFilterId) {
      api.get<TagType[]>('/tags').then((res) => {
        const t = res.data.find(tag => tag.id === tagFilterId);
        if (t) {
          setSelectedTags(prev => {
            if (!prev.some(existing => existing.id === tagFilterId)) {
              return [...prev, t];
            }
            return prev;
          });
          setShowFilters(true);
        }
      });
      setSearchParams(new URLSearchParams());
    }
  }, [tagFilterId, setSearchParams]);

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sortBy === 'date') {
      copy.sort((a, b) => +new Date(a.date) - +new Date(b.date));
    } else {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    }
    return copy;
  }, [items, sortBy]);

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

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 1 + i).toLocaleDateString(getDateLocale(), { weekday: 'short' }),
      ),
    [],
  );

  function eventsForDay(day: Date) {
    const key = formatDayKey(day.toISOString());
    return (eventsByDay.get(key) || []).slice().sort((a, b) => {
      return +new Date(a.date) - +new Date(b.date);
    });
  }

  const calendarTitle = useMemo(() => {
    return currentDate.toLocaleString(getDateLocale(), { month: 'long', year: 'numeric' });
  }, [currentDate]);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const query = selectedTags.length > 0 ? `?tags=${selectedTags.map(t => t.id).join(',')}` : '';
      const res = await api.get<PublicEvent[]>(`/events${query}`);
      setItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load events');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [selectedTags]);

  async function handleJoinLeave(e: React.MouseEvent, eventId: string, isJoined?: boolean) {
    e.stopPropagation();
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isJoined) {
        await api.post(`/events/${eventId}/leave`);
      } else {
        await api.post(`/events/${eventId}/join`);
      }
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Action failed');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Public events</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse events and join if you are logged in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${viewMode === 'list'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${viewMode === 'calendar'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
            >
              Calendar
            </button>
          </div>
          {viewMode === 'calendar' && (
            <>
              <div className="basis-full sm:hidden" />
              <Button variant="secondary" onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}>
                ‹
              </Button>
              <span className="min-w-[100px] sm:min-w-[140px] text-center text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {calendarTitle}
              </span>
              <Button variant="secondary" onClick={() => setCurrentDate((d) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}>
                ›
              </Button>
            </>
          )}
          <div className="basis-full sm:hidden" />
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            className={clsx("flex items-center gap-1.5", showFilters && "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span className="hidden sm:inline">Sort & Filters</span>
            {selectedTags.length > 0 && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
                {selectedTags.length}
              </span>
            )}
          </Button>
          <Button variant="secondary" onClick={load} disabled={busy}>
            <span className="hidden sm:inline">Refresh</span>
            <svg className="sm:hidden" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
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

      {showFilters && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200 mt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
              <div className="flex-1">
                <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">Sort Events</h3>
                <div className="flex w-max rounded-lg bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50">
                  <button
                    onClick={() => setSortBy('date')}
                    className={clsx("rounded-md px-4 py-1.5 text-xs font-semibold transition-all", sortBy === 'date' ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
                  >
                    By Date
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={clsx("rounded-md px-4 py-1.5 text-xs font-semibold transition-all", sortBy === 'name' ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200")}
                  >
                    By Name
                  </button>
                </div>
              </div>
              <div className="flex-[2] border-t border-slate-100 pt-4 dark:border-slate-700/50 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Filter by Tags</h3>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <TagMultiSelect
                  value={selectedTags}
                  onChange={setSelectedTags}
                  allowCreate={false}
                  maxTags={5}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {viewMode === 'list' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {sorted.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/events/${e.id}`)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
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
                          <span key={t.id} className={clsx("flex items-center gap-1 rounded bg-indigo-50 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300", t.imageUrl ? "pl-[3px] pr-1.5" : "px-1.5")}>
                            {t.imageUrl ? (
                              <img src={t.imageUrl} alt="" className="h-3.5 w-3.5 rounded-sm object-cover shrink-0" />
                            ) : (
                              <span className="font-bold opacity-50">#</span>
                            )}
                            <span>{t.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${e.isFull
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
                <div className="mt-3 flex items-center gap-2">
                  {!token ? (
                    <button
                      onClick={(ev) => handleJoinLeave(ev, e.id)}
                      className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      Join
                    </button>
                  ) : e.isJoined ? (
                    <button
                      onClick={(ev) => handleJoinLeave(ev, e.id, true)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Leave
                    </button>
                  ) : e.isFull ? (
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                      Full
                    </span>
                  ) : (
                    <button
                      onClick={(ev) => handleJoinLeave(ev, e.id)}
                      className="rounded-lg bg-indigo-500 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-400 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                      Join
                    </button>
                  )}
                  <Link
                    to={`/events/${e.id}`}
                    onClick={(ev) => ev.stopPropagation()}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Open full →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {!busy && sorted.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400">No events yet.</div>
          ) : null}
        </>
      )}

      {viewMode === 'calendar' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          {/* Desktop: grid calendar */}
          <div className="hidden md:block">
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
                      className={`flex min-h-[112px] min-w-0 flex-col border border-slate-200 p-2 dark:border-slate-500 ${inCurrentMonth
                        ? 'bg-indigo-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        : 'bg-white text-slate-400 dark:bg-slate-900 dark:text-slate-500'
                        }`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <div
                          className={`h-6 w-6 rounded-full text-center text-xs leading-6 ${isToday
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
                            <div className="font-semibold truncate">{ev.visibility === 'private' ? '🔒 ' : ''}{ev.title}</div>
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

          {/* Mobile: vertical day list */}
          <div className="block md:hidden space-y-2">
            {monthMatrix.flat().filter((day) => day.getMonth() === currentDate.getMonth()).map((day, idx) => {
              const dayEvents = eventsForDay(day);
              const isToday =
                formatDayKey(day.toISOString()) === formatDayKey(new Date().toISOString());
              return (
                <div key={idx}>
                  <div className="flex items-center gap-2 py-1.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isToday
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                    >
                      {day.getDate()}
                    </div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {day.toLocaleDateString(getDateLocale(), { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  {dayEvents.length > 0 ? (
                    <div className="ml-10 space-y-1.5 pb-2">
                      {dayEvents.map((ev) => (
                        <Link
                          key={ev.id}
                          to={`/events/${ev.id}`}
                          className="block rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm transition hover:border-indigo-300 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-indigo-600"
                        >
                          <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {ev.visibility === 'private' ? '🔒 ' : ''}{ev.title}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(ev.date)} · {ev.location} · {ev.participantsCount}/{ev.capacity >= 999999 ? '∞' : ev.capacity}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="ml-10 pb-1 text-xs text-slate-400 dark:text-slate-500">—</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'calendar' && !busy && sorted.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">No events yet.</div>
      ) : null}
    </div>
  );
}

