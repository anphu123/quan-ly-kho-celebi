// Force Vercel's tracer to include the built backend bundle in the function.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServerlessHandler } = require('../apps/backend/dist/serverless.js');

let handler: any = null;

export default async function (req: any, res: any) {
  // Vercel rewrites inject the `:path*` capture as a `path` query parameter.
  // Our Nest validation forbids unknown query keys, so strip it before routing.
  if (typeof req.url === 'string' && req.url.includes('path=')) {
    const url = new URL(req.url, 'http://localhost');
    url.searchParams.delete('path');
    req.url = `${url.pathname}${url.search}`;
    req.originalUrl = req.url;
  }

  if (req.query && Object.prototype.hasOwnProperty.call(req.query, 'path')) {
    delete req.query.path;
  }

  if (!handler) {
    handler = await createServerlessHandler();
  }
  handler(req, res);
}
