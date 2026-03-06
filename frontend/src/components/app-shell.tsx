import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuthStore } from '../stores/auth-store';
import { useThemeStore } from '../stores/theme-store';
import { useEffect } from 'react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrate);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const themeHydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    themeHydrate();
  }, [hydrate, themeHydrate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link
            to="/events"
            className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-slate-100"
          >
            Event Manager
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <nav className="flex items-center gap-2">
              <NavLink
                to="/events"
                end
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 text-sm text-center ${isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                Public events
              </NavLink>
              {token ? (
                <>
                  <NavLink
                    to="/events/new"
                    className={({ isActive }) =>
                      `rounded-full px-3 py-1 text-sm text-center ${isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    Create
                  </NavLink>
                  <NavLink
                    to="/me/events"
                    className={({ isActive }) =>
                      `rounded-full px-3 py-1 text-sm text-center ${isActive
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    My events
                  </NavLink>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      logout();
                      navigate('/events');
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate('/login')}>Login</Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

