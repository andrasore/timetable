import type { FastifyInstance } from "fastify";
import { renderIndex } from './Index.tsx';

export async function routes(fastify: FastifyInstance) {
  fastify.get("/", async function (request, reply) {
    const Index = await renderIndex(request);
    return reply.htmlRoot(<Index />);
  });
}
