import { DateTime } from 'luxon';
import db from '../db/db.ts';
import { readIcon } from '../util/icons.ts';
import type { Reservation } from './types.ts';

const WORKING_DAYS = [1, 2, 3, 4, 5] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

type HourType = 'office' | 'wfh';

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
  const reservations = await queryReservations(username);
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const addCircleIcon = await readIcon('add-circle-outline');
  const homeIcon = await readIcon('home-outline');
  const businessIcon = await readIcon('business-outline');

  return () => (
    <div hx-target="this" hx-swap="outerHTML" style="display: flex; flex-direction: column; gap: 1em;">
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <h1>{weekNo}. hét</h1>
        <button hx-get="/week">Back</button>
      </div>
      <style>{`
           table {
              width: 100%
           }
           table th:first-child {
              background-color: var(--color-table);
           }
           table td:first-child {
              background-color: var(--color-bg);
           }
           table th:not(:first-child) {
               min-width: 2em;
           }
           table td:not(:first-child) {
               min-width: 2em;
               cursor: pointer;
           }
           td svg path {
              opacity: 0.0;
           }
           td:hover svg path {
              opacity: 1.0;
              color: var(--color-secondary);
           }
        `}</style>
      <table style="display: table;" x-data="{
        inserting: false,
        handleClick (day, hour) {
          console.log(day, hour);
        },
        }">
        <thead>
          <tr>
            <th></th>
            {WORKING_HOURS.map((h) => (
              <th>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORKING_DAYS.map(day => {
            const currentDay = DateTime.now().startOf('week').plus({ days: day }).toISODate();
            // Rendering working hours as larger bricks instead of individual
            // squares
            const result = [];
            for (let i = 0; i < WORKING_HOURS.length; i++) {
              const reservation = reservations?.find((f) => f.fromHour == WORKING_HOURS[i] && f.date == currentDay);
              if (reservation) {
                // We do a little hacking...
                // When a reservation is found we must not iterate the hours it
                // spans
                const reservationLength = reservation.toHour - reservation.fromHour + 1;
                i += reservationLength - 1;
                result.push(<td colspan={reservationLength} class={reservation.type}>{HourTypeMap[reservation.type]}</td>);
              }
              else {
                result.push(<td/>);
              }
            }
            return <tr>
              <td>{DAY_NAMES[day]}</td>
              {result}
            </tr>;
          })}
        </tbody>
      </table>
      <form style="display: flex; gap: 1em; max-width: unset; min-width: unset;">
        <span>
          <input type="radio" id="radioButtonOffice" name="hourType" value="office" checked/>
          <label for="radioButtonOffice"><div dangerouslySetInnerHTML={{ __html: businessIcon }}/>Office</label>
        </span>
        <span>
          <input type="radio" id="radioButtonHome" name="hourType" value="wfh"/>
          <label for="radioButtonHome"><div dangerouslySetInnerHTML={{ __html: homeIcon }}/>Home</label>
        </span>
      </form>
    </div>
  );
};

const queryReservations = async (username: string) => {
  const startOfWeek = DateTime.now().startOf('week').toISODate();
  const endOfWeek = DateTime.now().endOf('week').toISODate();

  return db
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
};
