/** Auth-related query tokens for Closed Paid Beta flows. */

export const readInviteFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('invite');
  return value && value.trim() ? value.trim() : null;
};

export const readResetTokenFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('reset');
  return value && value.trim() ? value.trim() : null;
};

export const readVerifyTokenFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('verify');
  return value && value.trim() ? value.trim() : null;
};
