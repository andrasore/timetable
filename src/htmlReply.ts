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
            <!-- HTMX framework -->
            <script src="https://unpkg.com/htmx.org@2.0.0"></script>

            <meta charset="utf-8" />
            <title>Tube</title>
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
