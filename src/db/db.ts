import { Kysely, SqliteDialect } from 'kysely';
import BetterSqlite3 from 'better-sqlite3';
import type { UserTable } from '../users/types.ts';
import type { ReservationTable } from '../reservations/types.ts';

const database = new BetterSqlite3('./munkaido.sqlite');

const dialect = new SqliteDialect({
  database,
});

export type Database = {
  user: UserTable;
  reservation: ReservationTable;
};

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
const db = new Kysely<Database>({
  dialect,
});

export default db;
