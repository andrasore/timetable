import * as path from 'node:path';
import { fastify } from 'fastify';
import FastifyStatic from '@fastify/static';
import FastifyCookie from '@fastify/cookie';
import FastifyFormbody from '@fastify/formbody';
import { htmlReply } from './htmlReply.ts';
import { routes as indexRoutes } from './index/routes.ts';
import { routes as userRoutes } from './users/routes.ts';
import { routes as reservationRoutes } from './reservations/routes.ts';
import { ErrorPage } from './ErrorPage.tsx';

export async function bootstrap(port = 3000) {
  const app = fastify({
    logger: true,
  });

  const assetPath = path.join(import.meta.dirname, '../assets');
  await app.register(FastifyStatic, {root: assetPath,});
  await app.register(FastifyCookie);
  await app.register(FastifyFormbody);

  await app.register(htmlReply);

  app.setErrorHandler(function (error, request, reply) {
    if (error instanceof Error) {
      this.log.error(error)
      reply.status(500).html(ErrorPage({
        statusCode: 500,
        message: error.message,
        stack: error.stack
      }))
    } else {
      // fastify will use parent error handler to handle this
      reply.send(error)
    }
  });

  await app.register(userRoutes);
  await app.register(indexRoutes);
  await app.register(reservationRoutes);

  await app.listen({ port }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}

bootstrap()
  .catch((err) => console.log(err));
