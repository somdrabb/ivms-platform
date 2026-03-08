import { fetchJSON, buildQuery } from '../core/api.js';

export async function getTerminals(params = {}) {
  return fetchJSON(`/pos-terminals${buildQuery(params)}`, {}, { fallback: [] });
}

export async function bootstrapTerminal() {
  return fetchJSON('/pos/bootstrap', {}, { fallback: { ok: true } });
}

export async function registerTerminal(name) {
  return fetchJSON('/pos-terminals', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }, { fallback: { ok: true } });
}

export async function pingTerminal(id) {
  return fetchJSON(`/pos-terminals/${id}/ping`, {}, { fallback: { ok: true } });
}

export async function syncTerminal(id) {
  return fetchJSON(`/pos-terminals/${id}/sync`, { method: 'POST' }, { fallback: { ok: true } });
}
