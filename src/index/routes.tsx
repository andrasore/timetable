import z from 'zod';
import { DateTime } from 'luxon';
import type { FastifyInstance } from 'fastify';
import { renderIndex } from './Index.tsx';

export async function routes(fastify: FastifyInstance) {
  fastify.get('/', async function (request, reply) {
    const fromDate = DateTime.now().startOf('week');
    const username = request.cookies['username'];
    const Index = await renderIndex(fromDate, username);
    return reply.htmlRoot(<Index />);
  });

  const WeekViewParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  fastify.get('/:year/:weekNo', async function (request, reply) {
    const { year, weekNo } = WeekViewParamsSchema.parse(request.params);
    const fromDate = DateTime.utc(year).plus({ weeks: weekNo - 1 });
    const username = request.cookies['username'];
    const Index = await renderIndex(fromDate, username);
    return reply.htmlRoot(<Index />);
  });
}
