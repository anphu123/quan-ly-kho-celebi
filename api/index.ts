let handler: any = null;

export default async function (req: any, res: any) {
  if (!handler) {
    // Load the built Nest serverless entry so Vercel executes the backend bundle,
    // not the raw TypeScript source tree.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createServerlessHandler } = require('../apps/backend/dist/serverless');
    handler = await createServerlessHandler();
  }
  handler(req, res);
}
