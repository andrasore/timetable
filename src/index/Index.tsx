import type { DateTime } from 'luxon';
import { renderWeekView } from '../reservations/WeekView.tsx';
import { renderLoginForm } from '../users/LoginForm.tsx';

export const renderIndex = async (fromDate: DateTime, username?: string) => {
  const WeekView = await renderWeekView(fromDate);
  const LoginForm = await renderLoginForm(username);

  return () => (
    <>
      <header>
        <div class="nav--title-container">
          <h1 class="nav--title">Munkaidő</h1>
        </div>
        <LoginForm />
      </header>
      <main>
        <WeekView />
      </main>
    </>
  );
};
