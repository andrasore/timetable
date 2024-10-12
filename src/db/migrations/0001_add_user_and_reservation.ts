import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (col) => col.primaryKey().notNull().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute()

    await db.schema
    .createTable('reservation')
    .addColumn('id', 'integer', (col) => col.primaryKey().notNull().autoIncrement())
    .addColumn('userId', 'text', (col) => col.notNull())
    .addColumn('day', 'text', (col) => col.notNull())
    .addColumn('from_hour', 'integer', (col) => col.notNull())
    .addColumn('to_hour', 'integer', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
   await db.schema.dropTable('user').execute();
   await db.schema.dropTable('reservation').execute();
}
