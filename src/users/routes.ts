import type { FastifyInstance } from 'fastify';
import z from 'zod';
import db from '../db/db.ts';
import { LoggedInForm, NotLoggedInForm } from './views.tsx';

const LoginReqSchema = z.object({ username: z.string().min(1) });

export async function routes(fastify: FastifyInstance) {
  fastify.post('/login', async function (request, reply) {
    const { username } = LoginReqSchema.parse(request.body);

    const user = await db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      return reply.html(NotLoggedInForm());
    }

    reply.setCookie('username', username);

    // TODO maybe some feedback about wrong username
    return reply.html(LoggedInForm({ username }));
  });

  fastify.post('/register', async function (request, reply) {
    const { username } = LoginReqSchema.parse(request.body);

    const user = await db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      await db.insertInto('user').values({ username }).execute();

      reply.setCookie('username', username);
      return reply.html(LoggedInForm({ username }));
    } else {
      // TODO maybe some feedback about existing username
      return reply.html(NotLoggedInForm());
    }
  });

  fastify.get('/logout', async function (request, reply) {
    reply.clearCookie('username');
    return reply.html(NotLoggedInForm());
  });
}
