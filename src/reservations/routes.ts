import type { FastifyInstance } from 'fastify';
import { renderWeekTableRows } from './views.tsx';

export async function routes(fastify: FastifyInstance) {
    fastify.get('/week', async function (request, reply) {
        const WeekTableRows = await renderWeekTableRows();
        return reply.html(WeekTableRows());
    });
}
