import { DateTime } from "luxon";
import db from "../db/db.ts";

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<string, Record<number, WorkdayData>>;

const createWorkingHours = async (): Promise<WorkingHours> => {
  const startOfWeek = DateTime.now().startOf('week').toISODate();
  const endOfWeek = DateTime.now().endOf('week').toISODate();

  const reservations = await db.selectFrom('reservation')
                                .innerJoin('user', 'user_id', 'user.id')
                                .select(['user.username', 'reservation.id', 'reservation.type'])
                                .where(eb => eb.and([
                                  eb('reservation.date', '>', startOfWeek),
                                  eb('reservation.date', '<=', endOfWeek)]))
                                .execute();

  return Object.fromEntries(reservations.map(r => ([r.username, Object.fromEntries([0, 1, 2, 3, 4].map(i => [i, new Map()]))])))
}

export const renderWeekView = async () => {
  const users = await db.selectFrom('user')
    .select(['username'])
    .execute();
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const day = DateTime.now().setLocale('hu').toFormat('cccc');
  const workingHours = await createWorkingHours();

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
        <tbody>
          {users.map((user) => (
            <tr>
              <td>{user.username}</td>
              {[0, 1, 2, 3, 4].map(day => {
                return [...Array(12).keys()].map(hour => <td class={workingHours?.[user.username]?.[day]?.get(hour)}>{hour}</td>)
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>;
}
