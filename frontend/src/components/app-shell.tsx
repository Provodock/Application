import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuthStore } from '../stores/auth-store';
import { useThemeStore } from '../stores/theme-store';
import { useEffect } from 'react';
import { AiAssistantWidget } from './ui/ai-assistant-widget';

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
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center justify-between">
            <Link
              to="/events"
              className="text-lg font-extrabold tracking-wide text-slate-900 dark:text-slate-100 sm:text-xl"
            >
              Event Manager
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-lg border border-slate-200 bg-slate-100 p-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:hidden"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
          
          <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-4">
            <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
              <NavLink
                to="/events/archive"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-center ${isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect width="20" height="5" x="2" y="4" rx="2"/><path d="M4 9v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>
                <span className="hidden sm:inline">Archive</span>
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
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden items-center justify-center rounded-lg border border-slate-200 bg-slate-100 p-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex"
              title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      {/* AI Assistant Widget - Global */}
      <AiAssistantWidget />
    </div>
  );
}

