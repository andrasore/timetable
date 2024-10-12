import { fastify } from "fastify";
import { htmlReply } from "./htmlReply.ts";
import { routes as reservationRoutes } from "./reservations/routes.ts";

export async function bootstrap(port = 3000) {
  const app = fastify({
    logger: true,
  });

  await app.register(htmlReply);

  await app.register(reservationRoutes);

  const url = await app.listen({ port }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });

  return { app, url };
}

bootstrap()
  .then(() => console.log("Server started"))
  .catch((err) => console.log(err));
