import { DateTime } from 'luxon';
import db from '../db/db.ts';

const WORKING_DAYS = [0, 1, 2, 3, 4] as const;
const WORKING_HOURS = [
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const;

export const renderWeekEditor = async (from: DateTime, username: string) => {
  const reservations = await queryReservations(from, username);
  const weekNo = from.weekNumber;

  return () => (
    <div
      hx-target="this"
      hx-swap="outerHTML"
      class="week-editor--container"
      x-data={`{
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
              await htmx.ajax('POST', '${getWeekUrl(from)}/reservation', {
                values,
                swap: 'none',
              });
              this.intervalStart = null;
            } else {
              // insertion is not valid
              this.intervalStart = null;
            }
          },
      }`}
    >
      <div class="week-editor--title-container">
        <h2>{weekNo}. hét</h2>
        <button class="secondary" hx-get={'/week-viewer' + getWeekUrl(from)}>
          Back
        </button>
      </div>
      <WeekEditorTable from={from} reservations={reservations} />
      <form class="week-editor--hour-type-container">
        <HourTypeSelect hourType="office" />
        <HourTypeSelect hourType="wfh" />
        <HourTypeSelect hourType="holiday" />
      </form>
    </div>
  );
};

export const renderWeekEditorTable = async (from: DateTime, username: string) => {
  const reservations = await queryReservations(from, username);
  return () => <WeekEditorTable from={from} reservations={reservations}/>;
}

const WeekEditorTable = ({
  from,
  reservations,
}: {
  from: DateTime;
  reservations: Awaited<ReturnType<typeof queryReservations>>;
}) => (
      <table
        class="week-editor--table"
        x-bind:class="intervalStart && 'selecting'"
        hx-get={'/week-editor-table' + getWeekUrl(from)}
        hx-trigger="newReservation deleteReservation from:body"
        hx-target="this"
        hx-swap="outerHTML"
      >
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
      const currentDay = from.plus({ days: day });
      // Rendering working hours as larger bricks instead of individual
      // squares
      const result = [];
      for (let i = 0; i < WORKING_HOURS.length; i++) {
        const reservation = reservations?.find(
          (f) =>
            f.fromHour == WORKING_HOURS[i] && f.date == currentDay.toISODate(),
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
              hx-post={getWeekUrl(from) + '/delete-reservation'}
              hx-swap="outerHTML"
              hx-vals={`{"fromHour":${reservation.fromHour},"toHour":${reservation.toHour},"day":${day + 1}}`}
            >
              <div class={`marker--${reservation.type}`} />
            </td>,
          );
        } else {
          result.push(
            <td
              class="week-editor--table-td"
              x-on:click={`handleClick(${day + 1},${WORKING_HOURS[i]})`}
              x-bind:class={`intervalStart?.day == ${day + 1} && intervalStart?.hour == ${WORKING_HOURS[i]} && 'selected--' + hourType`}
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
);

const HourTypeSelect = ({ hourType }: { hourType: string }) => (
  <label for={`radioButton__${hourType}`} class="week-editor--hour-type-select">
    <input
      type="radio"
      id={`radioButton__${hourType}`}
      value={hourType}
      x-model="hourType"
    />
    <div class={`week-editor--radio-button-${hourType}`} />
    {hourType}
  </label>
);

const queryReservations = async (from: DateTime, username: string) => {
  const startOfWeek = from.startOf('week').toISODate();
  const endOfWeek = from.endOf('week').toISODate();

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

const getWeekUrl = (from: DateTime) => {
  return `/${from.weekYear}/${from.weekNumber}`;
};
