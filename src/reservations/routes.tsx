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

  fastify.post('/reservation', async function (request, reply) {
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const body = PostReservationReqSchema.parse(request.body);

    await db
      .insertInto('reservation')
      .values({
        user_id: userId,
        from_hour: body.fromHour,
        to_hour: body.toHour,
        type: body.hourType,
        // TODO allow insert for other weeks as well
        date: DateTime.now()
          .startOf('week')
          .plus({ days: body.day })
          .toISODate(),
      })
      .execute();

    reply.header('HX-Trigger', 'newReservation');
  });

  const DeleteReservationReqSchema = z.object({
    fromHour: z.coerce.number(),
    toHour: z.coerce.number(),
    day: z.coerce.number(),
  });

  fastify.post('/delete-reservation', async function (request, reply) {
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const body = DeleteReservationReqSchema.parse(request.body);

    await db
      .deleteFrom('reservation')
      .where((eb) =>
        eb.and([
          eb('user_id', '=', userId),
          eb('from_hour', '=', body.fromHour),
          eb('to_hour', '=', body.toHour),
          eb(
            'date',
            '=',
            DateTime.now().startOf('week').plus({ days: body.day }).toISODate(),
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
