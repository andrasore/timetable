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
}
