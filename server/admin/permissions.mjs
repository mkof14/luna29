export const hasAnyPermission = (sessionPayload, permissions) =>
  permissions.some((item) => sessionPayload.permissions.includes(item));

export const ADMIN_READ_PERMISSIONS = [
  'manage_services',
  'manage_marketing',
  'manage_email_templates',
  'manage_admin_roles',
  'view_financials',
  'view_technical_metrics',
];
