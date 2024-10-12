import * as path from 'node:path';
import { fastify } from 'fastify';
import FastifyStatic from '@fastify/static';
import FastifyCookie from '@fastify/cookie';
import FastifyFormbody from '@fastify/formbody';
import { htmlReply } from './htmlReply.ts';
import { routes as indexRoutes } from './index/routes.ts';
import { routes as userRoutes } from './users/routes.ts';
import { routes as reservationRoutes } from './reservations/routes.ts';

export async function bootstrap(port = 3000) {
  const app = fastify({
    logger: true,
  });

  const assetPath = path.join(import.meta.dirname, '../assets');
  console.log(assetPath);
  await app.register(FastifyStatic, {
    root: assetPath,
  });
  await app.register(FastifyCookie);
  await app.register(FastifyFormbody);
  await app.register(htmlReply);
  await app.register(userRoutes);
  await app.register(indexRoutes);
  await app.register(reservationRoutes);

  const url = await app.listen({ port }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

  return { app, url };
}

bootstrap()
  .then(() => console.log('Server started'))
  .catch((err) => console.log(err));
