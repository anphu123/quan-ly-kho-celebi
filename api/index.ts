import { createServerlessHandler } from '../apps/backend/src/serverless';

let handler: any = null;

export default async function (req: any, res: any) {
  if (!handler) {
    handler = await createServerlessHandler();
  }
  handler(req, res);
}
