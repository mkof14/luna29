import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiHandler } from '../server/core/apiHandler.mjs';
import { reportServerError, normalizePublicError } from '../server/core/serverErrorReporter.mjs';
import { isProductionLikeRuntime } from '../server/core/durableStorageGuard.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let requestHandlerPromise;

/** Keep raw body available for Stripe webhook HMAC (Vercel Node helpers). */
export const config = {
  api: {
    bodyParser: false,
  },
};

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
    reportServerError(error, { route: 'api/index', unhandled: true });
    const body = normalizePublicError({
      status: 500,
      publicCode: 'UNHANDLED_API_ERROR',
      message: error instanceof Error ? error.message : 'Internal server error.',
      isProductionLike: isProductionLikeRuntime(process.env),
      error,
    });
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  }
}
