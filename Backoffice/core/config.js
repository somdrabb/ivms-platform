export const CONFIG = {
  BASE_URL: localStorage.getItem('api_base') || 'http://localhost:4000',
  TOKEN: localStorage.getItem('auth_token') || null,
  THEME: localStorage.getItem('theme') || 'light',
};

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function setTheme(theme) {
  CONFIG.THEME = theme;
  applyTheme(theme);
}

applyTheme(CONFIG.THEME);
