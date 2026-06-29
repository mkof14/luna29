import { describe, expect, it } from 'vitest';
import { buildSuperAdminEmailSet, resolveRole, ROLE_PERMISSIONS } from '../../server/core/authRoles.mjs';

describe('authRoles', () => {
  it('grants super_admin only for explicit email list', () => {
    const admins = buildSuperAdminEmailSet('owner@luna.app');
    admins.add('owner@luna.app');
    expect(resolveRole('owner@luna.app', null, admins)).toBe('super_admin');
    expect(resolveRole('admin@luna.app', null, admins)).toBe('viewer');
    expect(resolveRole('founder@startup.io', null, admins)).toBe('viewer');
  });

  it('respects role override when valid', () => {
    expect(resolveRole('any@luna.app', 'finance_manager', new Set())).toBe('finance_manager');
    expect(ROLE_PERMISSIONS.finance_manager).toContain('view_financials');
  });
});
