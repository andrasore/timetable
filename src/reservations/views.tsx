import { DateTime } from 'luxon';

type WeekViewProps = {
    users: string[], weekNo: number, day: string
};

export const WeekView = ({ weekNo, users, day }: WeekViewProps) =>
    <>
      <h1>{weekNo}. hét, {day}</h1>
      <table>
        <thead>
          <tr>
            <th>Név</th>
            <th colspan="12">Hétfő</th>
            <th colspan="12">Kedd</th>
            <th colspan="12">Szerda</th>
            <th colspan="12">Csütörtök</th>
            <th colspan="12">Péntek</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr>
              <td>{user}</td>
              {[...Array(5).keys()].map(day => {
                 return [...Array(12).keys()].map(hour => <td>{hour}</td>)
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>;
