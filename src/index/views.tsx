import type { FastifyRequest } from 'fastify';
import { renderWeekView } from '../reservations/views.tsx';
import { renderLoginForm } from '../users/views.tsx';

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
  const LoginForm = await renderLoginForm(request);

  return () => <>
    <header>
      <nav role="navigation" aria-label="main navigation">
        <div style={CenteredHorizontalFlex}>
          <a href="/" style={HomeButtonStyle} />
          <h1>Munkaidő</h1>
        </div>
        <ul>
          <LoginForm />
        </ul>
      </nav>
    </header>
    <main>
        <WeekView />
    </main>
  </>;
};
