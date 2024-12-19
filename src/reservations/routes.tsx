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

    // If we were to swap results instead of sending a custom event, result
    // table data would have to have correct metadata as seen in WeekEditor.ts
    //let replacedHours = [];
    //for (let i = 0; i <= body.toHour - body.fromHour; i++) {
    //replacedHours.push(<td/>);
    //}
    //return reply.html(<>{replacedHours}</>);
  });
}
