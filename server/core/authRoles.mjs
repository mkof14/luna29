/** Role resolution — explicit super-admin list only; no auto-admin by email pattern. */
export const ROLE_PERMISSIONS = {
  /** Paying / beta members — no admin workspace access. */
  member: [],
  /** Explicit admin observer role (must be assigned). */
  viewer: ['view_financials', 'view_technical_metrics'],
  operator: ['manage_services', 'view_technical_metrics'],
  content_manager: ['manage_marketing', 'manage_email_templates'],
  finance_manager: ['view_financials'],
  super_admin: [
    'manage_services',
    'manage_marketing',
    'manage_email_templates',
    'manage_admin_roles',
    'view_financials',
    'view_technical_metrics',
  ],
};

export const buildSuperAdminEmailSet = (primaryEmail) => {
  const primary = String(primaryEmail || '').trim().toLowerCase();
  const fromEnv = `${process.env.SUPER_ADMIN_EMAILS || ''}${primary ? `,${primary}` : ''}`;
  return new Set(
    fromEnv
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
};

export const resolveRole = (email, roleOverride = null, superAdminEmails = new Set()) => {
  if (roleOverride && ROLE_PERMISSIONS[roleOverride]) return roleOverride;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (superAdminEmails.has(normalizedEmail)) return 'super_admin';
  return 'member';
};
