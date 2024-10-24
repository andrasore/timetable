import { render } from 'preact-render-to-string';
import { type FastifyInstance, type FastifyReply } from 'fastify';
import { type VNode } from 'preact';

export async function htmlReply(fastify: FastifyInstance) {
  fastify.decorateReply('html', function (this: FastifyReply, element: VNode) {
    this.header('Content-Type', 'text/html; charset=utf-8');
    this.send(render(element));
    return this;
  });

  fastify.decorateReply('htmlRoot', function (this: FastifyReply, element: VNode) {
    this.header('Content-Type', 'text/html; charset=utf-8');
    this.send(`<!doctype html>
      <html lang="en-US">
          <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <link rel="icon" href="/favicon.svg">

              <link rel="stylesheet" href="https://unpkg.com/mvp.css">

              <script src="https://unpkg.com/htmx.org@2.0.0"></script>
              <style>
                @import url("https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,200&display=swap");
                :root {
                  --font-family: Fraunces;
                }
              </style>

              <title>Munkaidő</title>
          </head>
          <body>
              ${render(element)}
          </body>
      </html>`);

    return this;
  });
}

// skip-override is requried to pass plugin context to parent fastify instance
// @ts-expect-error
htmlReply[Symbol.for('skip-override')] = true;

// Declare our method on fastify
declare module 'fastify' {
  interface FastifyReply {
    html(this: FastifyReply, element: VNode): FastifyReply;
    htmlRoot(this: FastifyReply, element: VNode): FastifyReply;
  }
}
