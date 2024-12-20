import z from 'zod';
import { DateTime } from 'luxon';
import db from '../db/db.ts';
import type { FastifyInstance } from 'fastify';
import { renderWeekView } from './WeekView.tsx';
import { renderWeekEditor } from './WeekEditor.tsx';

export async function routes(fastify: FastifyInstance) {
  const WeekViewParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  fastify.get('/week-view/:year/:weekNo', async function (request, reply) {
    const { year, weekNo } = WeekViewParamsSchema.parse(request.params);
    const fromDate = DateTime.utc(year).plus({ weeks: weekNo - 1 });
    const WeekView = await renderWeekView(fromDate);
    return reply.html(<WeekView />);
  });

  const WeekEditorParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  fastify.get('/week-editor/:year/:weekNo', async function (request, reply) {
    const username = request.cookies['username'];
    const { year, weekNo } = WeekEditorParamsSchema.parse(request.params);
    const fromDate = DateTime.utc(year).plus({ weeks: weekNo - 1 });
    const WeekEditor = await renderWeekEditor(fromDate, username!);
    return reply.html(<WeekEditor />);
  });

  const PostReservationParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  const PostReservationReqSchema = z.object({
    fromHour: z.coerce.number(),
    toHour: z.coerce.number(),
    day: z.coerce.number(),
    hourType: z.union([
      z.literal('office'),
      z.literal('wfh'),
      z.literal('holiday'),
    ]),
  });

  fastify.post('/:year/:weekNo/reservation', async function (request, reply) {
    const { year, weekNo } = PostReservationParamsSchema.parse(request.params);
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const { fromHour, toHour, hourType, day } = PostReservationReqSchema.parse(
      request.body,
    );

    const date = DateTime.utc(year)
      .plus({ weeks: weekNo - 1 })
      .setLocale('hu')
      .startOf('week')
      .plus({ days: day });

    await db
      .insertInto('reservation')
      .values({
        user_id: userId,
        from_hour: fromHour,
        to_hour: toHour,
        type: hourType,
        date: date.toISODate()!,
      })
      .execute();

    reply.header('HX-Trigger', 'newReservation');
  });

  const DeleteReservationParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  const DeleteReservationReqSchema = z.object({
    fromHour: z.coerce.number(),
    toHour: z.coerce.number(),
    day: z.coerce.number(),
  });

  fastify.post('/:year/:weekNo/delete-reservation', async function (request, reply) {
    const { year, weekNo } = DeleteReservationParamsSchema.parse(request.params);
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const { fromHour, toHour, day } = DeleteReservationReqSchema.parse(request.body);

    const date = DateTime.utc(year)
      .plus({ weeks: weekNo - 1 })
      .setLocale('hu')
      .startOf('week')
      .plus({ days: day });

    await db
      .deleteFrom('reservation')
      .where((eb) =>
        eb.and([
          eb('user_id', '=', userId),
          eb('from_hour', '=', fromHour),
          eb('to_hour', '=', toHour),
          eb(
            'date',
            '=',
            date.toISODate(),
          ),
        ]),
      )
      .execute();

    reply.header('HX-Trigger', 'newReservation');
  });

  const FeelingLuckyParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  fastify.get('/:year/:weekNo/feeling-lucky', async (request, reply) => {
    const { year, weekNo } = FeelingLuckyParamsSchema.parse(request.params);
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const startOfWeek = DateTime.utc(year)
      .plus({ weeks: weekNo - 2 }) // The previous week
      .setLocale('hu')
      .startOf('week');

    const reservations = await db
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
          eb('reservation.date', '>=', startOfWeek.toISODate()),
          eb('reservation.date', '<=', startOfWeek.plus({ days: 6 }).toISODate()),
          eb('user.username', '=', username),
        ]),
      )
    .execute();

    // Executing as multiple inserts because SQLite has different bulk insert
    // syntax and Kysely errors out
    for (const r of reservations) {
      await db
      .insertInto('reservation')
      .values({
        user_id: userId,
        from_hour: r.fromHour,
        to_hour: r.toHour,
        type: r.type,
        date: DateTime.fromISO(r.date).plus({ days: 7 }).toISODate()!,
      })
      .execute();
    }
  });
}
