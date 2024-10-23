import type { FastifyInstance } from "fastify";
import { renderIndex } from './views.tsx';

export async function routes(fastify: FastifyInstance) {
  fastify.get("/", async function (request, reply) {
    const Index = await renderIndex(request);
    return reply.html(Index());
  });
}
