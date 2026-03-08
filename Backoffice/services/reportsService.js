import { fetchJSON } from '../core/api.js';

export async function getReportSummary(params = {}) {
  const query = params.period ? `?period=${encodeURIComponent(params.period)}` : '';
  return fetchJSON(`/api/reports/summary${query}`, {}, { fallback: { period: 'today', totals: { sales: 0, items: 0, refunds: 0 } } });
}
