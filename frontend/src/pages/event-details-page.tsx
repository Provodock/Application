import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { api } from '../utils/api';
import { Button } from '../components/ui/button';
import { ConfirmModal } from '../components/confirm-modal';
import { EventDetails } from '../types';
import { useAuthStore } from '../stores/auth-store';
import { getDateLocale } from '../utils/locale';

function getInitials(email: string) {
  const part = email.split('@')[0] || '';
  if (part.length >= 2) return part.slice(0, 2).toUpperCase();
  return part.toUpperCase() || '?';
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(getDateLocale(), { dateStyle: 'medium', timeStyle: 'short' });
}

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [item, setItem] = useState<EventDetails | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  async function load() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.get<EventDetails>(`/events/${id}`);
      setItem(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load event');
    } finally {
      setBusy(false);
    }
  }

  async function join() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/events/${id}/join`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Join failed');
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/events/${id}/leave`);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Leave failed');
    } finally {
      setBusy(false);
    }
  }

  function openDeleteModal() {
    setDeleteModalOpen(true);
  }

  async function removeEvent() {
    if (!id) return;
    setDeleteModalOpen(false);
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete event');
    } finally {
      setBusy(false);
    }
  }

  const isOrganizer = user?.id && item?.organizer?.id && user.id === item.organizer.id;

  useEffect(() => {
    load();
  }, [id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/events" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            ← Back
          </Link>
          <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">Event details</h1>
        </div>
        <Button variant="secondary" onClick={load} disabled={busy}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {item ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{item.title}</div>
                {item.visibility === 'private' && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
                    🔒 Private
                  </span>
                )}
              </div>
              <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description || '—'}</div>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <Link key={t.id} to={`/events?tag=${t.id}`} className={clsx("flex items-center gap-1.5 rounded-md bg-indigo-50 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50", t.imageUrl ? "pl-1 pr-2" : "px-2")}>
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt="" className="h-[18px] w-[18px] rounded object-cover shrink-0 bg-white" />
                      ) : (
                        <span className="font-bold opacity-50">#</span>
                      )}
                      <span>{t.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${item.isFull
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                }`}
            >
              {item.isFull ? 'Full' : 'Open'}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
            <div className="text-slate-400 dark:text-slate-500">When</div>
            <div>{formatDate(item.date)}</div>
            <div className="text-slate-400 dark:text-slate-500">Where</div>
            <div>{item.location}</div>
            <div className="text-slate-400 dark:text-slate-500">Organizer</div>
            <div>{item.organizer?.email || '—'}</div>
            <div className="text-slate-400 dark:text-slate-500">Participants</div>
            <div>
              {item.participantsCount}/{item.capacity === 999999 ? '∞' : item.capacity}
            </div>
          </div>

          {item.participants && item.participants.length > 0 ? (
            <div className="mt-4">
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Participants list
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.participants.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    title={p.email}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                      {getInitials(p.email)}
                    </span>
                    {p.email}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!token ? (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {item.visibility === 'private'
                  ? 'This event is private. Log in to join.'
                  : 'Log in to join.'}
              </div>
            ) : item.isJoined ? (
              <Button variant="secondary" onClick={leave} disabled={busy}>
                Leave event
              </Button>
            ) : (
              <Button onClick={join} disabled={busy || item.isFull}>
                Join
              </Button>
            )}
            {isOrganizer && (
              <>
                <Link to={`/events/${id}/edit`}>
                  <Button variant="secondary" disabled={busy}>
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" onClick={openDeleteModal} disabled={busy}>
                  Delete event
                </Button>
              </>
            )}
          </div>
        </div>
      ) : busy ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">Loading…</div>
      ) : null}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete event"
        message="Are you sure you want to delete this event?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={removeEvent}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

