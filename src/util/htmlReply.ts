import { render } from 'preact-render-to-string';
import { type FastifyInstance, type FastifyReply } from 'fastify';
import { type VNode } from 'preact';

export async function htmlReply(fastify: FastifyInstance) {
  fastify.decorateReply('html', function (this: FastifyReply, element: VNode) {
    this.header('Content-Type', 'text/html; charset=utf-8');
    this.send(render(element));
    return this;
  });

  fastify.decorateReply(
    'htmlRoot',
    function (this: FastifyReply, element: VNode) {
      this.header('Content-Type', 'text/html; charset=utf-8');
      this.send(`<!doctype html>
      <html lang="en-US">
          <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <meta name="color-scheme" content="light dark">
              <link rel="icon" href="/favicon.svg">

              <link rel="stylesheet" href="/style.css">

              <script defer src="https://unpkg.com/htmx.org@2.0.0"></script>

              <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

              <title>Munkaidő</title>
          </head>
          <body>
              ${render(element)}
          </body>
      </html>`);

      return this;
    },
  );
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
