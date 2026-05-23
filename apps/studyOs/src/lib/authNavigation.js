/**
 * Authentication Navigation Utilities
 * Handles seamless transitions between Study OS and Main Website
 */

export const buildRedirectUrl = (baseUrl, path = window.location.href) => {
  const url = new URL(baseUrl);
  url.searchParams.set('redirect', path);
  return url.toString();
};

export const openLogin = () => {
  const mainWebsite = import.meta.env.VITE_MAIN_WEBSITE || 'https://www.sailibrary.online';
  const loginUrl = buildRedirectUrl(`${mainWebsite}/login`);
  window.open(loginUrl, '_blank');
};

export const openSignup = () => {
  const mainWebsite = import.meta.env.VITE_MAIN_WEBSITE || 'https://www.sailibrary.online';
  const signupUrl = buildRedirectUrl(`${mainWebsite}/signup`);
  window.open(signupUrl, '_blank');
};

/**
 * Shared logout state management
 * This can be used to trigger the UI confirmation
 */
export const logoutWithConfirm = (confirmFn) => {
  if (confirmFn) {
    confirmFn();
  }
};
