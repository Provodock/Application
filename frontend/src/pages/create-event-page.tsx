import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { TagMultiSelect } from '../components/ui/tag-multi-select';
import { api } from '../utils/api';

function toLocalDateTimeValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function CreateEventPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('New event');
  const [description, setDescription] = useState('Short description…');
  const [location, setLocation] = useState('Online');
  const [capacity, setCapacity] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0);
    return toLocalDateTimeValue(d);
  });

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create event</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Title, date, and location required. Date must be in the future.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <div className="grid gap-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            placeholder="Unlimited"
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
            label="Date"
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
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const iso = new Date(date).toISOString();
                const cap = capacity.trim() === '' ? undefined : parseInt(capacity, 10);
                if (cap !== undefined && (isNaN(cap) || cap < 1)) {
                  setError('Capacity must be at least 1 if set.');
                  setBusy(false);
                  return;
                }
                await api.post('/events', {
                  title,
                  description,
                  location,
                  ...(cap !== undefined && { capacity: cap }),
                  visibility,
                  date: iso,
                  tagIds: tags.map((t) => t.id),
                }).then((res) => {
                  navigate(`/events/${res.data.id}`);
                });
              } catch (e: any) {
                setError(e?.response?.data?.message || 'Create failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Creating…' : 'Create'}
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => navigate('/events')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

