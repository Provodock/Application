import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/login-page';
import { PublicEventsPage } from './pages/public-events-page';
import { EventDetailsPage } from './pages/event-details-page';
import { CreateEventPage } from './pages/create-event-page';
import { EditEventPage } from './pages/edit-event-page';
import { MyEventsPage } from './pages/my-events-page';
import { AppShell } from './components/app-shell';
import { useAuthStore } from './stores/auth-store';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events" element={<PublicEventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route
            path="/events/:id/edit"
            element={
              <RequireAuth>
                <EditEventPage />
              </RequireAuth>
            }
          />
          <Route
            path="/events/new"
            element={
              <RequireAuth>
                <CreateEventPage />
              </RequireAuth>
            }
          />
          <Route
            path="/me/events"
            element={
              <RequireAuth>
                <MyEventsPage />
              </RequireAuth>
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

