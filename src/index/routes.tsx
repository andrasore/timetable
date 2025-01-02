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

  /** This is for loading index with HTMX */
  fastify.get('/index', async function (request, reply) {
    const fromDate = DateTime.now().startOf('week');
    const username = request.cookies['username'];
    const Index = await renderIndex(fromDate, username);
    return reply.html(<Index />);
  });

  const WeekViewParamsSchema = z.object({
    year: z.coerce.number(),
    weekNo: z.coerce.number(),
  });

  fastify.get('/:year/:weekNo', async function (request, reply) {
    const { year, weekNo } = WeekViewParamsSchema.parse(request.params);
    const fromDate = DateTime.utc(year).plus({ weeks: weekNo });
    const username = request.cookies['username'];
    const Index = await renderIndex(fromDate, username);
    return reply.htmlRoot(<Index />);
  });
}
