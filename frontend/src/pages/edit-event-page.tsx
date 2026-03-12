import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { TagMultiSelect, TagType } from '../components/ui/tag-multi-select';
import { api } from '../utils/api';
import { EventDetails } from '../types';
import { useAuthStore } from '../stores/auth-store';

function toLocalDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

const UNLIMITED_CAPACITY = 999999;

export function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [busy, setBusy] = useState(false);
  const [loadBusy, setLoadBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [tags, setTags] = useState<TagType[]>([]);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadBusy(true);
    setError(null);
    api
      .get<EventDetails>(`/events/${id}`)
      .then((res) => {
        if (cancelled) return;
        const e = res.data;
        if (e.organizer?.id !== user?.id) {
          setError('Only the organizer can edit this event.');
          setLoadBusy(false);
          return;
        }
        setTitle(e.title);
        setDescription(e.description ?? '');
        setLocation(e.location);
        setCapacity(e.capacity >= UNLIMITED_CAPACITY ? '' : String(e.capacity));
        setVisibility(e.visibility || 'public');
        setTags(e.tags || []);
        setDate(toLocalDateTimeValue(new Date(e.date)));
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load event');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  async function submit() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const iso = new Date(date).toISOString();
      const capRaw = capacity.trim() === '' ? null : parseInt(capacity, 10);
      const cap = capRaw === null ? UNLIMITED_CAPACITY : capRaw;
      if (cap < 1) {
        setError('Capacity must be at least 1.');
        setBusy(false);
        return;
      }
      const eventDate = new Date(iso);
      if (eventDate.getTime() <= Date.now()) {
        setError('Event date must be in the future.');
        setBusy(false);
        return;
      }
      await api.patch(`/events/${id}`, {
        title,
        description: description || undefined,
        location,
        capacity: cap,
        visibility,
        date: iso,
        tagIds: tags.map((t) => t.id),
      });
      navigate(`/events/${id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  if (loadBusy) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">Loading…</div>
    );
  }

  if (error && !title) {
    return (
      <div className="space-y-4">
        <Link
          to={id ? `/events/${id}` : '/events'}
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Back to event
        </Link>
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <Link
          to={id ? `/events/${id}` : '/events'}
          className="text-sm text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Back to event
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100">
          Edit event
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Title, date, and location are required. Date must be in the future.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="grid gap-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Input
            label="Capacity (leave empty for unlimited)"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
          <TagMultiSelect
            label="Tags"
            value={tags}
            onChange={setTags}
            maxTags={5}
            isCollapsible={true}
          />
          <Input
            label="Date & time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Visibility
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="accent-indigo-600"
                />
                🌐 Public
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="accent-indigo-600"
                />
                🔒 Private
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <Button disabled={busy} onClick={submit}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => navigate(id ? `/events/${id}` : '/events')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
