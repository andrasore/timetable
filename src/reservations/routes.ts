import type { FastifyInstance } from "fastify";
import { index } from './views.tsx';

export async function routes(fastify: FastifyInstance) {
  fastify.get("/", async function (request, reply) {
    return reply.html(index());
  });

  /*
  fastify.get("/video/:videoId", opts, async function (request, reply) {
    const { videoId } = request.params as { videoId: number };
    const video = await getVideoContent(videoId);
    reply.header('Content-Type', 'video/mp4');
    return reply.send(video.content.data);
  });
  */
}
