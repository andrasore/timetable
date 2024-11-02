import { DateTime } from 'luxon';
import db from '../db/db.ts';

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<string, Record<number, WorkdayData>>;

const WORKING_DAYS = [1, 2, 3, 4, 5] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

const HourTypeMap = {
  office: 'i',
  wfh: 'x',
  none: '',
} as const;

const DAY_NAMES = {
  1: 'Hétfő',
  2: 'Kedd',
  3: 'Szerda',
  4: 'Csütörtök',
  5: 'Péntek',
} as const;

export const renderWeekView = async () => {
  const users = await db.selectFrom('user').select(['username']).execute();

  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const workingHours = await queryWorkingHours(users.map((u) => u.username));

  /* NOTE:
    Sticky table columns require:
    - relative poisitioning of td/th elems
    - sticky position for sticky column
    - larger z index for sticky column
    */

  return () => (
    <div
      hx-target="this"
      hx-swap="outerHTML"
      hx-get="/week"
      hx-trigger="newUser from:body"
    >
      <style>{`
        table {
          box-shadow: var(--box-shadow) var(--color-shadow);
        }
        table th {
          padding: 7px;
        }
        table td {
          min-width: 11px;
          min-height: 11px;
          padding: 7px;
        }
        td.none + td.office, td.none + td.wfh {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
        }
        td.office:has(+ td.none), td.wfh:has(+ td.none) {
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        table td.office {
          background-color: #048A81;
          border-style: none;
        }
        table td.wfh {
          background-color: #FDE2FF;
          border-style: none;
        }
        table th:first-child {
          background-color: var(--color-table);
        }
        table td:first-child {
          background-color: var(--color-bg);
        }
        div.grid-container {
          display: grid;
          grid-template-columns: fit-content(50%) fit-content(50%);
          gap: 20px;
          justify-content: space-between;
        }
    `}</style>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <h1>{weekNo}. hét</h1>
        <button hx-get="/editor">Edit</button>
      </div>
      <div class="grid-container">
        {WORKING_DAYS.map((d) => (
          <table>
            <thead>
              <tr>
                <th />
                <th colspan={15}>{DAY_NAMES[d]}</th>
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
                workingHours={workingHours}
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
  workingHours,
  dayNo,
}: {
  users: string[];
  workingHours: WorkingHours;
  dayNo: number;
}) => (
  <>
    {users.map((user) => (
      <tr>
        <td>{user}</td>
        {WORKING_HOURS.map((hour) => {
          const hourType = workingHours?.[user]?.[dayNo]?.get(hour) ?? 'none';
          return (
            <td class={hourType}>
              {hourType && hourType in HourTypeMap ? HourTypeMap[hourType] : ''}
            </td>
          );
        })}
      </tr>
    ))}
  </>
);

const queryWorkingHours = async (users: string[]): Promise<WorkingHours> => {
  const startOfWeek = DateTime.now().startOf('week').toISODate();
  const endOfWeek = DateTime.now().endOf('week').toISODate();

  const reservations = await db
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
        eb('reservation.date', '>', startOfWeek),
        eb('reservation.date', '<=', endOfWeek),
      ]),
    )
    .execute();

  const workingHours = Object.fromEntries(
    users.map((user) => [
      user,
      Object.fromEntries(WORKING_DAYS.map((i) => [i, new Map()])),
    ]),
  );

  for (const reservation of reservations) {
    const weekday = DateTime.fromISO(reservation.date).weekday;
    for (let h = reservation.fromHour; h <= reservation.toHour; h++) {
      workingHours[reservation.username][weekday].set(h, reservation.type);
    }
  }

  return workingHours;
};
