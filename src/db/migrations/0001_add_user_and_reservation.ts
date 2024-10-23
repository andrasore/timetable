import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().notNull().autoIncrement(),
    )
    .addColumn('username', 'text', (col) => col.notNull())
    .execute();

  await db.schema
    .createTable('reservation')
    .addColumn('id', 'integer', (col) =>
      col.primaryKey().notNull().autoIncrement(),
    )
    .addColumn('user_id', 'text', (col) => col.notNull())
    .addColumn('date', 'text', (col) => col.notNull())
    .addColumn('type', 'text', (col) => col.notNull())
    .addColumn('from_hour', 'integer', (col) => col.notNull())
    .addColumn('to_hour', 'integer', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('user').execute();
  await db.schema.dropTable('reservation').execute();
}
