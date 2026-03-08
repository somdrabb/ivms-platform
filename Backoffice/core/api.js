import { CONFIG } from './config.js';

export const BASE_HEADERS = {
  Accept: 'application/json',
};

function getActiveShopId() {
  if (window.currentShop?.id) return window.currentShop.id;
  return localStorage.getItem('shop:id') || 'shop-1';
}

function buildHeaders(extraHeaders = {}) {
  const headers = {
    ...BASE_HEADERS,
    ...extraHeaders,
  };

  if (CONFIG.TOKEN) {
    headers.Authorization = `Bearer ${CONFIG.TOKEN}`;
  }

  const shopId = getActiveShopId();
  if (shopId) {
    headers['X-Shop-ID'] = shopId;
  }

  return headers;
}

function normalizeUrl(path = '') {
  const base = String(CONFIG.BASE_URL || '').replace(/\/+$/, '');
  const rawPath = String(path || '');
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const resolvedPath = resolveAlias(cleanPath);
  const baseEndsWithApi = base.endsWith('/api');
  const pathStartsWithApi = resolvedPath.startsWith('/api');
  const adjustedPath = baseEndsWithApi && pathStartsWithApi
    ? resolvedPath.slice(4) || '/'
    : resolvedPath;
  return `${base}${adjustedPath}`;
}

function resolveAlias(path) {
  if (path.startsWith('/api/inventory')) {
    return path.replace('/api/inventory', '/api/products');
  }
  return path;
}

export function buildQuery(params = {}) {
  const q = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return q ? `?${q}` : '';
}

export async function fetchJSON(path, options = {}, { fallback } = {}) {
  const url = normalizeUrl(path);

  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options.headers || {}),
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    if (fallback !== undefined) return fallback;
    throw new Error(
      typeof payload === 'object' && payload?.error
        ? payload.error
        : `Request failed: ${response.status}`
    );
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data;
  }

  return payload;
}
