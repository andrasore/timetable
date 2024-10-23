import type { FastifyInstance } from 'fastify';
import z from 'zod';
import db from '../db/db.ts';
import { renderLoginForm } from './views.tsx';

const LoginReqSchema = z.object({ username: z.string().min(1) });

// TODO verify if username stored in cookie actually exists

export async function routes(fastify: FastifyInstance) {
  fastify.post('/login', async function (request, reply) {
    const { username } = LoginReqSchema.parse(request.body);

    const user = await db
      .selectFrom('user')
      .select('id')
      .where('username', '=', username)
      .executeTakeFirst();

    if (!user) {
      const LoginForm = await renderLoginForm();
      return reply.html(LoginForm());
    }

    reply.setCookie('username', username);

    const LoginForm = await renderLoginForm(username);
    // TODO maybe some feedback about wrong username
    return reply.html(LoginForm());
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
      const LoginForm = await renderLoginForm(username);
      reply.header('HX-Trigger', 'newUser');
      return reply.html(LoginForm());
    }
    // TODO maybe some feedback about existing username
    const LoginForm = await renderLoginForm();
    return reply.html(LoginForm());
  });

  fastify.get('/logout', async function (request, reply) {
    reply.clearCookie('username');
    const LoginForm = await renderLoginForm();
    return reply.html(LoginForm());
  });
}
