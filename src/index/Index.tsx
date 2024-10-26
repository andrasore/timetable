import { DateTime } from "luxon";
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

  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const day = DateTime.now().setLocale('hu').toFormat('cccc');

  return () => <>
    <header>
      <nav role="navigation" aria-label="main navigation" style="margin-bottom: 0px">
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
        <h1>{weekNo}. hét, {day}</h1>
        <WeekView />
    </main>
  </>;
};
