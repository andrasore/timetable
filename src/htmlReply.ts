import { render } from "preact-render-to-string";
import { type FastifyInstance, type FastifyReply } from "fastify";
import { type VNode } from "preact";

export async function htmlReply(fastify: FastifyInstance) {
  fastify.decorateReply("html", function (this: FastifyReply, element: VNode) {
    this.header("Content-Type", "text/html; charset=utf-8");
    this.send(`
        <!doctype html>
        <html lang="en-US">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1">

            <style>
                @import "https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css";
            </style>

            <script src="https://unpkg.com/htmx.org@2.0.0"></script>

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
htmlReply[Symbol.for("skip-override")] = true;

// Declare our method on fastify
declare module "fastify" {
  interface FastifyReply {
    html(this: FastifyReply, element: VNode): FastifyReply;
  }
}
