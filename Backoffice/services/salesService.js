import { fetchJSON, buildQuery } from '../core/api.js';

export async function getSales(params = {}) {
  return fetchJSON(`/api/sales${buildQuery(params)}`, {}, { fallback: [] });
}

export async function exportSalesCSV(params = {}) {
  return fetchJSON(`/api/sales/export${buildQuery(params)}`, {}, { fallback: { ok: true } });
}
