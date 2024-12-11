import type { FastifyRequest } from 'fastify';
import { renderWeekView } from '../reservations/WeekView.tsx';
import { renderLoginForm } from '../users/LoginForm.tsx';

const HomeButtonStyle = `
  min-width: 1.5cm;
  min-height: 1.5cm;
  background-image: url(/favicon.svg);
  background-repeat: no-repeat;
  background-size: 100%;
  background-center: 100%;
`;

const CenteredHorizontalFlex = `
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
`;

export const renderIndex = async (request: FastifyRequest) => {
  const WeekView = await renderWeekView();
  const username = request.cookies['username'];
  const LoginForm = await renderLoginForm(username);

  return () => (
    <>
      <header>
        <div style={CenteredHorizontalFlex}>
          <h1 class="nav-title">Munkaidő</h1>
        </div>
        <LoginForm />
      </header>
      <main>
        <WeekView />
      </main>
    </>
  );
};
