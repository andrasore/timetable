import { DateTime } from 'luxon';
import db from '../db/db.ts';
import { readIcon } from '../util/icons.ts';

const WORKING_DAYS = [1, 2, 3, 4, 5] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<number, WorkdayData>;

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

export const renderWeekEditor = async (username: string) => {
  const workingHours = await queryWorkingHours(username);
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const addCircleIcon = await readIcon('add-circle-outline');

  return () => (
    <div hx-target="this" hx-swap="outerHTML">
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <h1>{weekNo}. hét</h1>
        <button hx-get="/week">Back</button>
      </div>
      <style>{`
           table {
              width: 100%
           }
           td:hover {
              cursor: pointer;
           }
           table th:first-child {
              background-color: var(--color-table);
           }
           table td:first-child {
              background-color: var(--color-bg);
           }
        `}</style>
      <table style="display: table;">
        <thead>
          <tr>
            <th></th>
            {WORKING_HOURS.map((h) => (
              <th>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORKING_DAYS.map((d) => (
            <tr>
              <td>{DAY_NAMES[d]}</td>
              {WORKING_HOURS.map((hour) => {
                const hourType = workingHours?.[d]?.get(hour) ?? 'none';
                return (
                  <td class={hourType}>
                    {hourType && hourType in HourTypeMap
                      ? HourTypeMap[hourType]
                      : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const queryWorkingHours = async (username: string): Promise<WorkingHours> => {
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
        eb('user.username', '=', username),
      ]),
    )
    .execute();

  const workingHours = Object.fromEntries(
    WORKING_DAYS.map((i) => [i, new Map()]),
  );

  for (const reservation of reservations) {
    const weekday = DateTime.fromISO(reservation.date).weekday;
    for (let h = reservation.fromHour; h <= reservation.toHour; h++) {
      workingHours[weekday].set(h, reservation.type);
    }
  }

  return workingHours;
};
