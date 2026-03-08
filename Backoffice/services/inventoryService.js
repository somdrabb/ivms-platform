import { fetchJSON, buildQuery } from '../core/api.js';

export async function getInventory(params = {}) {
  return fetchJSON(`/inventory${buildQuery(params)}`, {}, { fallback: [] });
}

export async function createProduct(payload) {
  return fetchJSON('/inventory', { method: 'POST', body: JSON.stringify(payload) }, { fallback: { ok: true } });
}

export async function updateProduct(sku, payload) {
  return fetchJSON(`/inventory/${encodeURIComponent(sku)}`, { method: 'PUT', body: JSON.stringify(payload) }, { fallback: { ok: true } });
}
