import type { FastifyInstance } from 'fastify';

export async function routes(fastify: FastifyInstance) {
    fastify.get('/week', async function () {
    });
}
