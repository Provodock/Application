import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuthStore } from '../stores/auth-store';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === 'login' ? 'Login' : 'Create account'),
    [mode],
  );

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-600 dark:bg-slate-800">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Use seeded users or create a new one.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />

        {error ? (
          <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                if (mode === 'login') await login(email, password);
                else await register(email, password);
                navigate('/events');
              } catch (e: any) {
                setError(e?.response?.data?.message || 'Request failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Login' : 'Register'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            className="border-2 border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
            onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
          >
            Switch to {mode === 'login' ? 'register' : 'login'}
          </Button>
        </div>
      </div>
    </div>
  );
}

