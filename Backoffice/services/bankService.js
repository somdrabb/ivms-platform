import { fetchJSON } from '../core/api.js';

export async function getBankAccounts() {
  return fetchJSON('/bank-accounts', {}, { fallback: [] });
}

export async function addBankAccount(payload) {
  return fetchJSON('/bank-accounts', { method: 'POST', body: JSON.stringify(payload) }, { fallback: { ok: true } });
}

export async function reconcileAccount(id) {
  return fetchJSON(`/bank-accounts/${id}/reconcile`, { method: 'POST' }, { fallback: { ok: true } });
}
