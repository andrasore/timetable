import { DateTime } from 'luxon';
import db from '../db/db.ts';
import { readIcon } from '../util/icons.ts';

const WORKING_DAYS = [0, 1, 2, 3, 4] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

const HourTypeMap = {
  office: 'i',
  wfh: 'x',
  none: '',
} as const;

export const renderWeekEditor = async (username: string) => {
  const reservations = await queryReservations(username);
  const weekNo = DateTime.now().setLocale('hu').weekNumber;
  const addCircleIcon = await readIcon('add-circle-outline');
  const homeIcon = await readIcon('home-outline');
  const businessIcon = await readIcon('business-outline');

  return () => (
    <div
      hx-target="this"
      hx-swap="outerHTML"
      hx-get="/editor"
      hx-trigger="newReservation deleteReservation from:body"
      class="week-editor--container"
      x-data="{
          intervalStart: null,
          hourType: 'office',

          async handleClick(day, hour) {
            if (this.intervalStart === null) {
              this.intervalStart = { day, hour };
            } else if (
              this.intervalStart.day === day &&
              this.intervalStart.hour < hour
            ) {
              // insertion is valid
              const values = {
                day: day,
                fromHour: this.intervalStart.hour,
                toHour: hour,
                hourType: this.hourType,
              };
              // TODO maybe swap in post response instead of custom event
              await htmx.ajax('POST', '/reservation', {
                values,
                swap: 'none',
              });
            } else {
              // insertion is not valid
              this.intervalStart = null;
            }
          },
        }"
    >
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
              transition: opacity 1s
              color: var(--color-secondary);
           }
           td:hover svg path {
              opacity: 1.0;
              color: var(--color-secondary);
           }
           table td.office {
             background-color: #048A81;
             border-radius: 10px;
           }
           table td.wfh {
             background-color: #FDE2FF;
             border-radius: 10px;
           }
           table td.selected ~ td:has(~ td:hover) {
             background-color: #00FF00;
           }
           table td.selected ~ td:hover {
             background-color: #00FF00;
           }
           table td.selected {
             background-color: #00FF00;
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
          {WORKING_DAYS.map((day) => {
            const currentDay = DateTime.now()
              .startOf('week')
              .plus({ days: day });
            // Rendering working hours as larger bricks instead of individual
            // squares
            const result = [];
            for (let i = 0; i < WORKING_HOURS.length; i++) {
              const reservation = reservations?.find(
                (f) =>
                  f.fromHour == WORKING_HOURS[i] &&
                  f.date == currentDay.toISODate(),
              );
              if (reservation) {
                // We do a little hacking...
                // When a reservation is found we must not iterate the hours it
                // spans
                const reservationLength =
                  reservation.toHour - reservation.fromHour + 1;
                i += reservationLength - 1;
                result.push(
                  <td
                    colspan={reservationLength}
                    class={reservation.type}
                    hx-target="this"
                    hx-post="/delete-reservation"
                    hx-swap="outerHTML"
                    hx-vals={`{"fromHour":${reservation.fromHour},"toHour":${reservation.toHour},"day":${day}}`}
                        >
                    {HourTypeMap[reservation.type]}
                  </td>,
                );
              } else {
                result.push(
                  <td
                    dangerouslySetInnerHTML={{ __html: addCircleIcon }}
                    x-on:click={`handleClick(${day},${WORKING_HOURS[i]})`}
                    x-bind:class={`intervalStart?.day == ${day} && intervalStart?.hour == ${WORKING_HOURS[i]} && 'selected'`}
                  />,
                );
              }
            }
            return (
              <tr>
                <td>{currentDay.setLocale('hu').toFormat('cccc')}</td>
                {result}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* FIXME bug where form is reset after creating a reservation */}
      <form style="display: flex; gap: 1em; max-width: unset; min-width: unset;">
        <span>
          <input
            type="radio"
            id="radioButtonOffice"
            value="office"
            x-model="hourType"
          />
          <label for="radioButtonOffice">
            <div dangerouslySetInnerHTML={{ __html: businessIcon }} />
            Office
          </label>
        </span>
        <span>
          <input
            type="radio"
            id="radioButtonHome"
            value="wfh"
            x-model="hourType"
          />
          <label for="radioButtonHome">
            <div dangerouslySetInnerHTML={{ __html: homeIcon }} />
            Home
          </label>
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
        eb('reservation.date', '>=', startOfWeek),
        eb('reservation.date', '<=', endOfWeek),
        eb('user.username', '=', username),
      ]),
    )
    .execute();
};
