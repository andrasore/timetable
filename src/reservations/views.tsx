import { DateTime } from "luxon";
import db from "../db/db.ts";

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<string, Record<number, WorkdayData>>;

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

  const workingHours = Object.fromEntries(users.map(user => ([user, Object.fromEntries([1, 2, 3, 4, 5].map(i => [i, new Map()]))])));

  for (const reservation of reservations) {
    const weekday = DateTime.fromISO(reservation.date).weekday;
    for (let h = reservation.fromHour; h++; h <= reservation.toHour) {
      workingHours[reservation.username][weekday].set(h, reservation.type);
    }
  }

  return workingHours;
}

export const renderWeekView = async () => {
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const day = DateTime.now().setLocale('hu').toFormat('cccc');
  const TableRows = await renderWeekTableRows();

  return () => <>
      <style>{`
        tr td {
          padding: 0;
          min-width: 20px;
          min-height: 20px;
        }
        tr td .office .wfh {
          color: green;
        }
        tr td .empty {
          color: red;
        }
    `}</style>
      <h1>{weekNo}. hét, {day}</h1>
      <table>
        <thead>
          <tr>
            <th>Név</th>
            <th colspan={12}>Hétfő</th>
            <th colspan={12}>Kedd</th>
            <th colspan={12}>Szerda</th>
            <th colspan={12}>Csütörtök</th>
            <th colspan={12}>Péntek</th>
          </tr>
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
          {[1, 2, 3, 4, 5].map(day => {
            return [...Array(12).keys()].map(hour => <td class={workingHours?.[user.username]?.[day]?.get(hour)}>{hour}</td>)
          })}
        </tr>
      ))
    }</>;
}
