import z from 'zod';
import { DateTime } from 'luxon';
import db from '../db/db.ts';
import type { FastifyInstance } from 'fastify';
import { renderWeekView } from './WeekView.tsx';
import { renderWeekEditor } from './WeekEditor.tsx';

export async function routes(fastify: FastifyInstance) {
  fastify.get('/week', async function (request, reply) {
    const WeekView = await renderWeekView();
    return reply.html(<WeekView />);
  });

  fastify.get('/editor', async function (request, reply) {
    const username = request.cookies['username'];
    const WeekEditor = await renderWeekEditor(username!);
    return reply.html(<WeekEditor />);
  });

  const ReservationReqSchema = z.object({
    start: z.object({ day: z.number(), hour: z.number() }),
    end: z.object({ day: z.number(), hour: z.number() }),
    hourType: z.union([z.literal('office'), z.literal('wfh')]),
  });

  fastify.post('/reservation', async function (request, reply) {
    const username = request.cookies['username']!;
    const userId = db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username);

    const body = ReservationReqSchema.parse(request.body);

    await db
      .insertInto('reservation')
      .values({
        user_id: userId,
        from_hour: body.start.hour,
        to_hour: body.end.hour,
        type: body.hourType,
        // TODO allow insert for other weeks as well
        date: DateTime.now()
          .startOf('week')
          .plus({ days: body.start.day })
          .toISODate(),
      })
      .execute();

    reply.header('HX-Trigger', 'newReservation');
  });
}
