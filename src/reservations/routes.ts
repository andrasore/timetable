import type { FastifyInstance } from 'fastify';
import { renderWeekTableRows, renderWeekView } from './WeekView.tsx';
import { renderWeekEditor } from './WeekEditor.tsx';

export async function routes(fastify: FastifyInstance) {
    fastify.get('/week', async function (request, reply) {
        const WeekView = await renderWeekView();
        return reply.html(WeekView());
    });

    fastify.get('/week-rows', async function (request, reply) {
        const WeekTableRows = await renderWeekTableRows();
        return reply.html(WeekTableRows());
    });

    fastify.get('/editor', async function (request, reply) {
        const WeekEditor = await renderWeekEditor();
        return reply.html(WeekEditor());
    });
}
