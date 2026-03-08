import { fetchJSON, buildQuery } from '../core/api.js';

export async function getCashiers(params = {}) {
  return fetchJSON(`/cashiers${buildQuery(params)}`, {}, { fallback: [] });
}

export async function createCashier(payload) {
  return fetchJSON('/cashiers', { method: 'POST', body: JSON.stringify(payload) }, { fallback: { ok: true } });
}

export async function updateCashier(id, payload) {
  return fetchJSON(`/cashiers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, { fallback: { ok: true } });
}

export async function resetCashierPassword(id) {
  return fetchJSON(`/cashiers/${id}/reset-password`, { method: 'POST' }, { fallback: { ok: true } });
}
