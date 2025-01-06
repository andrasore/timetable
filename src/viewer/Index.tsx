import type { DateTime } from 'luxon';
import { renderWeekViewer } from './WeekViewer.tsx';
import { renderLoginForm } from '../login/LoginForm.tsx';

export const renderIndex = async (fromDate: DateTime, username?: string) => {
  const WeekViewer = await renderWeekViewer(fromDate);
  const LoginForm = await renderLoginForm(username);

  return () => (
    <body>
      <header>
        <div class="nav--title-container">
          <h1
            class="nav--title"
            hx-get="/index"
            hx-push-url="/"
            hx-target="closest body"
          >
            Munkaidő
          </h1>
        </div>
        <LoginForm />
      </header>
      <main>
        <WeekViewer />
      </main>
    </body>
  );
};
