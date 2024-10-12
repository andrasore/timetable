import type { FastifyInstance } from "fastify";
import { Index } from './views.tsx';
import db from '../db/db.ts';
import { DateTime } from 'luxon';


export async function routes(fastify: FastifyInstance) {
  fastify.get("/", async function (request, reply) {
    const username = request.cookies['username'];

    const users = await db.selectFrom('user').select('username').execute();

    const weekNo = DateTime.now().setLocale('hu').weekNumber;
    const day = DateTime.now().setLocale('hu').toFormat('cccc');

    return reply.html(Index({
        users: users.map(user => user.username),
        username,
        weekNo,
        day
    }));
  });
}
