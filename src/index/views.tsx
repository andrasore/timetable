import { WeekView } from '../reservations/views.tsx';
import { LoggedInForm, NotLoggedInForm } from '../users/views.tsx';

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

type IndexProps = { users: string[], username?: string, weekNo: number, day: string };

export const Index = ({ users, username, weekNo, day }: IndexProps) => (
  <>
    <header>
      <nav role="navigation" aria-label="main navigation">
        <div style={CenteredHorizontalFlex}>
          <a href="/" style={HomeButtonStyle} />
          <h1>Munkaidő</h1>
        </div>
        <ul>
          {username ? (
            <LoggedInForm username={username} />
          ) : (
            <NotLoggedInForm />
          )}
        </ul>
      </nav>
    </header>
    <main>
        <WeekView weekNo={weekNo} users={users} day={day} />
    </main>
  </>
);
