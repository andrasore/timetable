import { DateTime } from "luxon";
import db from "../db/db.ts";

type HourType = 'office' | 'wfh';
type WorkdayData = Map<number, HourType>;
type WorkingHours = Record<string, Record<number, WorkdayData>>;

const WORKING_DAYS = [1, 2, 3, 4, 5];
const WORKING_HOURS = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

const HourTypeMap = {
  'office': 'Iroda :)',
  'wfh': 'Otthon >:c',
} as const;

export const renderWeekView = async () => {
  const TableRows = await renderWeekTableRows();

  /* NOTE:
    Sticky table columns require:
    - relative poisitioning of td/th elems
    - sticky position for sticky column
    - larger z index for sticky column
    */

  return () => <>
      <style>{`
        table {
          box-shadow: var(--box-shadow) var(--color-shadow);
        }
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
        table td.office {
          border-radius: 10px;
          background-color: #048A81;
          box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
        }
/*
        table td + td.office {
          border-top-right-radius: 5px;
          border-top-left-radius: 5px;
        }
*/
        table td.wfh {
          border-radius: 10px;
          background-color: #FDE2FF;
          box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
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
    `}</style>
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

    const reservations = await queryReservationsByUser(users.map(u => u.username));

    return () => <>{
      users.map((user) => (
        <tr>
          <td>{user.username}</td>
          {WORKING_DAYS.map(day => {
            const currentDay = DateTime.now().startOf('week').plus({ days: day }).toISODate();
            // Rendering working hours as larger bricks instead of individual
            // squares
            const result = [];
            for (let i = 0; i < WORKING_HOURS.length; i++) {
              const reservation = reservations[user.username]?.find((f) => f.fromHour == WORKING_HOURS[i] && f.date == currentDay);
              if (reservation) {
                // We do a little hacking...
                // When a reservation is found we must not iterate the hours it
                // spans
                const reservationLength = reservation.toHour - reservation.fromHour + 1;
                i += reservationLength;
                result.push(<td colspan={reservationLength} class={reservation.type}>{HourTypeMap[reservation.type]}</td>);
              }
              else {
                result.push(<td/>);
              }
            }
            return result;
          })}
        </tr>
      ))
    }</>;
}

const queryReservationsByUser = async (users: string[]) => {
  const startOfWeek = DateTime.now().startOf('week').toISODate();
  const endOfWeek = DateTime.now().endOf('week').toISODate();

  const reservations = await db.selectFrom('reservation')
                                .innerJoin('user', 'user_id', 'user.id')
                                .select(['user.username', 'reservation.type', 'reservation.date', 'reservation.from_hour as fromHour', 'reservation.to_hour as toHour'])
                                .where(eb => eb.and([
                                  eb('reservation.date', '>', startOfWeek),
                                  eb('reservation.date', '<=', endOfWeek)]))
                                .execute();

  return Object.groupBy(reservations, r => r.username);
}
