import { DateTime } from 'luxon';
import db from '../db/db.ts';

const WORKING_DAYS = [0, 1, 2, 3, 4] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

export const renderWeekView = async (from: DateTime) => {
  const users = await db.selectFrom('user').select(['username']).execute();

  const weekNo = from.setLocale('hu').weekNumber;
  const reservations = await queryReservations(from);

  return () => (
    <div
      hx-target="this"
      hx-swap="outerHTML"
      hx-get={getViewerUrl(from)}
      hx-trigger="newUser from:body"
      class="week-view--container"
    >
      <div class="week-view--title-container">
        <div style="display: flex; gap: 1rem">
          <button
            style="min-width: unset;"
            class="secondary"
            hx-get={'/week-view' + getPreviousWeekUrl(from)}
            hx-push-url={getPreviousWeekUrl(from)}
          >
            ←
          </button>
          <h2>{weekNo}. hét</h2>
          <button
            style="min-width: unset;"
            class="secondary"
            hx-get={'/week-view' + getNextWeekUrl(from)}
            hx-push-url={getNextWeekUrl(from)}
          >
            →
          </button>
        </div>
        <button class="secondary" hx-get={getEditorUrl(from)}>Edit</button>
      </div>
      <div class="week-view--table-container">
        {WORKING_DAYS.map((d) => (
          <table class="week-view--table">
            <thead>
              <tr>
                <th />
                <th colspan={15}>
                  {
                    /* TODO add config for locale */
                    DateTime.now()
                      .startOf('week')
                      .plus({ days: d })
                      .setLocale('hu')
                      .toFormat('cccc (LLL d)')
                  }
                </th>
              </tr>
              <tr>
                <th></th>
                {WORKING_HOURS.map((h) => (
                  <th>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <DayTableRows
                users={users.map((u) => u.username)}
                reservations={reservations}
                startOfWeek={from.setLocale('hu')}
                dayNo={d}
              />
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
};

const DayTableRows = ({
  users,
  reservations,
  startOfWeek,
  dayNo,
}: {
  users: string[];
  reservations: Awaited<ReturnType<typeof queryReservations>>;
  startOfWeek: DateTime;
  dayNo: number;
}) => (
  <>
    {users.map((user) => {
      const rows = [];
      const date = startOfWeek.plus({ days: dayNo }).toISODate();

      for (let i = 0; i < WORKING_HOURS.length; i++) {
        const reservation = reservations?.[user]?.find(
          (f) => f.fromHour == WORKING_HOURS[i] && f.date == date,
        );
        if (reservation) {
          // We do a little hacking...
          // When a reservation is found we must not iterate the hours it
          // spans
          const reservationLength =
            reservation.toHour - reservation.fromHour + 1;
          i += reservationLength - 1;
          rows.push(
            <td colspan={reservationLength}>
              <div class={`marker--${reservation.type}`} />
            </td>,
          );
        } else {
          rows.push(<td />);
        }
      }

      return (
        <tr>
          <td>{user}</td>
          {rows}
        </tr>
      );
    })}
  </>
);

const queryReservations = async (from: DateTime) => {
  const startOfWeek = from.setLocale('hu').startOf('week').toISODate();
  const endOfWeek = from.setLocale('hu').endOf('week').toISODate();

  const result = await db
    .selectFrom('reservation')
    .innerJoin('user', 'user_id', 'user.id')
    .select([
      'user.username',
      'reservation.type',
      'reservation.date',
      'reservation.from_hour as fromHour',
      'reservation.to_hour as toHour',
    ])
    .where((eb) =>
      eb.and([
        eb('reservation.date', '>=', startOfWeek),
        eb('reservation.date', '<=', endOfWeek),
      ]),
    )
    .execute();

  return Object.groupBy(result, (res) => res.username);
};

const getPreviousWeekUrl = (from: DateTime) => {
  if (from.weekNumber == 1) {
    return `/${from.year - 1}/52`;
  } else {
    return `/${from.year}/${from.weekNumber - 1}`;
  }
};

const getNextWeekUrl = (from: DateTime) => {
  if (from.weekNumber == 52) {
    return `/${from.year + 1}/1`;
  } else {
    return `/${from.year}/${from.weekNumber + 1}`;
  }
};

const getEditorUrl = (from: DateTime) => {
  return `/week-editor/${from.year}/${from.weekNumber - 1}`;
};

const getViewerUrl = (from: DateTime) => {
  return `/week-view/${from.year}/${from.weekNumber - 1}`;
};
