const DEFAULT_MAX_BODY_BYTES = Number(process.env.API_MAX_BODY_BYTES || 2_000_000);

export const readBodyWithLimit = async (req, maxBytes = DEFAULT_MAX_BODY_BYTES) => {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error(`Request body too large (max ${maxBytes} bytes).`);
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON body');
  }
};

export const readRawBodyWithLimit = async (req, maxBytes = DEFAULT_MAX_BODY_BYTES) => {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      throw new Error(`Request body too large (max ${maxBytes} bytes).`);
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

export const hasAiProcessingConsent = (req) => {
  const header = String(req.headers['x-luna-ai-consent'] || '').trim().toLowerCase();
  return header === '1' || header === 'true' || header === 'yes';
};
