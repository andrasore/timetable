export const pageTemplate = (content: string) => `
<!doctype html>
<html lang="en-US">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="/favicon.svg">
        <link rel="stylesheet" href="https://unpkg.com/mvp.css">

        <script src="https://unpkg.com/htmx.org@2.0.0"></script>

        <title>Munkaidő</title>
    </head>
    <body>
        ${content}
    </body>
</html>`;
