import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApiHandler } from './core/apiHandler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.AUTH_API_PORT || 8787);
const DATA_DIR = process.env.LUNA_API_DATA_DIR
  ? path.resolve(process.env.LUNA_API_DATA_DIR)
  : path.join(__dirname, 'data');

const sendError = (res, error) => {
  const message = error instanceof Error ? error.message : 'Internal server error.';
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Local node entry: keep message for diagnosis; never attach stack/body.
  res.end(JSON.stringify({ error: message, code: 'UNHANDLED_API_ERROR' }));
};

buildApiHandler({
  dataDir: DATA_DIR,
  environment: 'node',
})
  .then((requestHandler) => {
    const server = http.createServer(async (req, res) => {
      try {
        await requestHandler(req, res);
      } catch (error) {
        sendError(res, error);
      }
    });

    server.listen(PORT, () => {
      process.stdout.write(`[luna-auth-api] listening on http://localhost:${PORT}\n`);
    });
  })
  .catch((error) => {
    process.stderr.write(`[luna-auth-api] failed to start: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
