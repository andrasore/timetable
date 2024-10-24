import { DateTime } from "luxon";
import db from "../db/db.ts";

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<string, Record<number, WorkdayData>>;

const WORKING_DAYS = [1, 2, 3, 4, 5];
const WORKING_HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const HourTypeMap = {
  'office': 'i',
  'wfh': 'x',
} as const;

export const renderWeekView = async () => {
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const day = DateTime.now().setLocale('hu').toFormat('cccc');
  const TableRows = await renderWeekTableRows();

  /* NOTE:
    Sticky table columns require:
    - relative poisitioning of td/th elems
    - sticky position for sticky column
    - larger z index for sticky column
    */

  return () => <>
      <style>{`
        table td {
          padding: 2;
          min-width: 11px;
          min-height: 11px;
          position: relative;
          z-index: 0;
          border: 1px solid var(--color-shadow);
        }
        table td:nth-child(${WORKING_HOURS.length}n+1) {
          border-right: 1px solid var(--color-text-secondary);
        }
        table th:nth-child(${WORKING_HOURS.length}n+1) {
          border-right: 1px solid var(--color-text-secondary);
        }
        table th {
          padding: 2;
          position: relative;
          z-index: 0;
        }
        table td .office, table td .wfh {
          background-color: green;
        }
        table th:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          background-color: var(--color-table);
        }
        table td:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          background-color: var(--color-bg);
        }
        table td .empty {
          background-color: red;
        }
    `}</style>
      <h1>{weekNo}. hét, {day}</h1>
      <table>
        <thead>
          <tr>
            <th>Név</th>
            <th colspan={15}>Hétfő</th>
            <th colspan={15}>Kedd</th>
            <th colspan={15}>Szerda</th>
            <th colspan={15}>Csütörtök</th>
            <th colspan={15}>Péntek</th>
          </tr>
          <tr><th></th>{WORKING_DAYS.map(_ => WORKING_HOURS.map(h => <th>{h}</th>))}</tr>
        </thead>
        <tbody id="week-table" hx-get="/week" hx-trigger="newUser from:body">
          <TableRows/>
        </tbody>
      </table>
    </>;
}

export const renderWeekTableRows = async () => {
    const users = await db.selectFrom('user')
      .select(['username'])
      .execute();

    const workingHours = await createWorkingHours(users.map(u => u.username));

    return () => <>{
      users.map((user) => (
        <tr>
          <td>{user.username}</td>
          {WORKING_DAYS.map(day => {
            return WORKING_HOURS.map(hour => {
              const hourType = workingHours?.[user.username]?.[day]?.get(hour);
              return <td class={hourType}>{hourType && hourType in HourTypeMap ? HourTypeMap[hourType] : ''}</td>;
            })
          })}
        </tr>
      ))
    }</>;
}

const createWorkingHours = async (users: string[]): Promise<WorkingHours> => {
  const startOfWeek = DateTime.now().startOf('week').toISODate();
  const endOfWeek = DateTime.now().endOf('week').toISODate();

  const reservations = await db.selectFrom('reservation')
                                .innerJoin('user', 'user_id', 'user.id')
                                .select(['user.username', 'reservation.type', 'reservation.date', 'reservation.from_hour as fromHour', 'reservation.to_hour as toHour'])
                                .where(eb => eb.and([
                                  eb('reservation.date', '>', startOfWeek),
                                  eb('reservation.date', '<=', endOfWeek)]))
                                .execute();

  const workingHours = Object.fromEntries(users.map(user => ([user, Object.fromEntries(WORKING_DAYS.map(i => [i, new Map()]))])));

  for (const reservation of reservations) {
    const weekday = DateTime.fromISO(reservation.date).weekday;
    for (let h = reservation.fromHour; h <= reservation.toHour; h++) {
      workingHours[reservation.username][weekday].set(h, reservation.type);
    }
  }

  return workingHours;
}
