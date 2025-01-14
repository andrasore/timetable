import { Kysely, SqliteDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';
import type { UserTable } from './users.ts';
import type { ReservationTable } from './reservations.ts';

const database = new BetterSqlite3('./munkaido.sqlite');

const dialect = new SqliteDialect({
  database,
});

export type Database = {
  user: UserTable;
  reservation: ReservationTable;
};

const db = new Kysely<Database>({
  log: ['query', 'error'],
  dialect,
});

export default db;
