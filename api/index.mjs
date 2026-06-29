import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiHandler } from '../server/core/apiHandler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let requestHandlerPromise;

export default async function handler(req, res) {
  if (!requestHandlerPromise) {
    requestHandlerPromise = buildApiHandler({
      dataDir: process.env.VERCEL ? '/tmp/luna-api' : path.join(__dirname, 'data'),
      environment: process.env.VERCEL ? 'vercel' : 'node',
    });
  }

  try {
    const requestHandler = await requestHandlerPromise;
    return await requestHandler(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error.';
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: message, code: 'UNHANDLED_API_ERROR' }));
  }
}
