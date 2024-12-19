import type { DateTime } from 'luxon';
import { renderWeekView } from '../reservations/WeekView.tsx';
import { renderLoginForm } from '../users/LoginForm.tsx';

export const renderIndex = async (fromDate: DateTime, username?: string) => {
  const WeekView = await renderWeekView(fromDate);
  const LoginForm = await renderLoginForm(username);

  return () => (
    <body>
      <header>
        <div class="nav--title-container">
          <h1 class="nav--title" hx-get="/index" hx-push-url="/" hx-target="closest body">Munkaidő</h1>
        </div>
        <LoginForm />
      </header>
      <main>
        <WeekView />
      </main>
    </body>
  );
};
