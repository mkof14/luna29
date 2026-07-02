/** Env-aware integration checks for admin platform tab. */
export const computeIntegrationsHealth = () => {
  const has = (key) => Boolean(String(process.env[key] || '').trim());

  return [
    {
      id: 'postgres',
      name: 'Postgres',
      ok: has('DATABASE_URL'),
      envKey: 'DATABASE_URL',
      detail: has('DATABASE_URL') ? 'Persistence layer configured.' : 'Set DATABASE_URL for durable storage.',
    },
    {
      id: 'resend',
      name: 'Resend',
      ok: has('RESEND_API_KEY'),
      envKey: 'RESEND_API_KEY',
      detail: has('RESEND_API_KEY') ? 'Transactional email ready.' : 'Add RESEND_API_KEY to deliver system mail.',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      ok: has('STRIPE_SECRET_KEY'),
      envKey: 'STRIPE_SECRET_KEY',
      detail: has('STRIPE_SECRET_KEY') ? 'Billing API key present.' : 'Configure Stripe for live subscriptions.',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      ok: has('GEMINI_API_KEY') || has('API_KEY'),
      envKey: 'GEMINI_API_KEY',
      detail: has('GEMINI_API_KEY') || has('API_KEY') ? 'Narrative engine key present.' : 'Set GEMINI_API_KEY for AI features.',
    },
    {
      id: 'elevenlabs',
      name: 'ElevenLabs',
      ok: has('ELEVENLABS_API_KEY'),
      envKey: 'ELEVENLABS_API_KEY',
      detail: has('ELEVENLABS_API_KEY') ? 'Voice synthesis configured.' : 'Optional — enable voice replies.',
    },
  ];
};
