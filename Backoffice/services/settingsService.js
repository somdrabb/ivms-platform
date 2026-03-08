import { fetchJSON } from '../core/api.js';

export async function pingHealth() {
  return fetchJSON('/health', {}, { fallback: { status: 'ok' } });
}
