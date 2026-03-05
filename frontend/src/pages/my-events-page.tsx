import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { MyEvent } from '../types';

type View = 'month' | 'week';

function formatDayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MyEventsPage() {
  const [view, setView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [items, setItems] = useState<MyEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<MyEvent[]>('/me/events', { params: { view } });
      setItems(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load my events');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, [view]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, MyEvent[]>();
    for (const ev of items) {
      const key = formatDayKey(ev.date);
      map.set(key, [...(map.get(key) || []), ev]);
    }
    return map;
  }, [items]);

  const monthMatrix = useMemo(() => {
    if (view !== 'month') return [];
    const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDay = (firstOfMonth.getDay() + 6) % 7; // Monday=0
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
  }, [currentDate, view]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const currentWeek = useMemo(() => {
    if (view !== 'week') return [];
    const day = new Date(currentDate);
    const weekday = (day.getDay() + 6) % 7; // Monday=0
    const monday = new Date(day);
    monday.setDate(day.getDate() - weekday);
    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return d;
    });
  }, [currentDate, view]);

  const title = useMemo(() => {
    const month = currentDate.toLocaleString(undefined, { month: 'long' });
    const year = currentDate.getFullYear();
    if (view === 'month') return `${month} ${year}`;
    const weekStart = currentWeek[0];
    const weekEnd = currentWeek[6];
    if (!weekStart || !weekEnd) return `${month} ${year}`;
    return `${weekStart.toLocaleDateString()} – ${weekEnd.toLocaleDateString()}`;
  }, [currentDate, currentWeek, view]);

  function goPrev() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(prev.getMonth() - 1);
      else d.setDate(prev.getDate() - 7);
      return d;
    });
  }

  function goNext() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(prev.getMonth() + 1);
      else d.setDate(prev.getDate() + 7);
      return d;
    });
  }

  function eventsForDay(day: Date) {
    const key = formatDayKey(day.toISOString());
    return (eventsByDay.get(key) || []).slice().sort((a, b) => {
      return +new Date(a.date) - +new Date(b.date);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">My events</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Calendar view of events where you are organizer or participant.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={goPrev}>
            ‹
          </Button>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 min-w-[180px] text-center">
            {title}
          </div>
          <Button variant="secondary" onClick={goNext}>
            ›
          </Button>
          <Button
            variant={view === 'month' ? 'primary' : 'secondary'}
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'primary' : 'secondary'}
            onClick={() => setView('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Month view: grid 6x7 */}
      {view === 'month' && (
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
                        className={`h-6 w-6 rounded-full text-center text-xs font-semibold leading-6 ${
                          isToday
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-2 dark:ring-indigo-400/80 dark:ring-offset-slate-800'
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
                          className="block rounded-md bg-indigo-50 px-2 py-1 text-[11px] text-indigo-900 transition hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-900/60"
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

      {/* Week view: 1x7 with time+title */}
      {view === 'week' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-200 text-sm dark:border-slate-500">
            {currentWeek.map((day, idx) => {
              const dayEvents = eventsForDay(day);
              const isToday =
                formatDayKey(day.toISOString()) === formatDayKey(new Date().toISOString());
              return (
                <div key={idx} className="flex min-w-0 flex-col border border-slate-200 dark:border-slate-500">
                  <div className="flex min-h-[56px] flex-col justify-center border-b border-slate-200 bg-slate-100 px-2 py-3 dark:border-slate-500 dark:bg-slate-700">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                      {weekDays[idx]}
                    </div>
                    <div
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-2 dark:ring-indigo-400/80 dark:ring-offset-slate-700'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                  <div className="min-h-[120px] space-y-2 p-2">
                    {dayEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        to={`/events/${ev.id}`}
                        className="block rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {ev.title}
                            </div>
                            <div className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                              {formatTime(ev.date)} · {ev.location}
                            </div>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {ev.role}
                          </div>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-400">
                          {ev.participantsCount} participants ·{' '}
                          {ev.isFull ? 'Full' : 'Open'}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!busy && items.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">
          You are not part of any events yet. Explore public events and join.
        </div>
      ) : null}
    </div>
  );
}

