import type { FastifyInstance } from 'fastify';
import z from 'zod';
import db from '../db/db.ts';
import { renderLoginForm } from './LoginForm.tsx';
import { ErrorToast } from '../util/ErrorToast.tsx';

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
      return reply.html(
        <>
          <LoginForm />
          <ErrorToast message="😤 Nincs ilyen felhasználó!" />
        </>,
      );
    }

    reply.setCookie('username', username);

    const LoginForm = await renderLoginForm(username);
    return reply.html(<LoginForm />);
  });

  const LoginReqSchema = z.object({ username: z.string().min(1) });

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
      return reply.html(<LoginForm />);
    }

    const LoginForm = await renderLoginForm();
    return reply.html(
      <>
        <LoginForm />
        <ErrorToast message="😤 Már létezik ilyen felhasználó!" />
      </>,
    );
  });

  fastify.get('/logout', async function (request, reply) {
    reply.clearCookie('username');
    const LoginForm = await renderLoginForm();
    return reply.html(<LoginForm />);
  });
}
