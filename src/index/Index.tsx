import type { FastifyRequest } from 'fastify';
import { renderWeekView } from '../reservations/WeekView.tsx';
import { renderLoginForm } from '../users/LoginForm.tsx';

export const renderIndex = async (request: FastifyRequest) => {
  const WeekView = await renderWeekView();
  const username = request.cookies['username'];
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
