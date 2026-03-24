// Force Vercel's tracer to include the built backend bundle in the function.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createServerlessHandler } = require('../apps/backend/dist/serverless.js');

let handler: any = null;

export default async function (req: any, res: any) {
  if (!handler) {
    handler = await createServerlessHandler();
  }
  handler(req, res);
}
