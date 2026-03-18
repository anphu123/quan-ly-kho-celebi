// Vercel serverless entry point for NestJS backend.
// No static NestJS imports here — they live in apps/backend/node_modules,
// not in the root node_modules. esbuild follows the require() below
// and finds them via the backend's own node_modules.

let handler: any = null;

export default async function (req: any, res: any) {
  if (!handler) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createServerlessHandler } = require('../apps/backend/dist/serverless');
    handler = await createServerlessHandler();
  }
  handler(req, res);
}
