export const $ = (sel, ctx=document) => ctx.querySelector(sel);
export const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
export const setTitle = (title) => { $('#page-title').textContent = title; };

export function formatMoney(value) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
}

export function isoToLocal(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export const Loading = () => `<div class="center" style="padding:1rem"><div class="spinner"></div></div>`;
export const ErrorBanner = (msg) => `<div class="error-banner"><strong>Error:</strong> ${msg}</div>`;

export function EmptyState(message, actions = []) {
  const buttons = actions
    .map((action) => {
      const { label, id, variant = 'btn-primary' } = action;
      const attr = id ? `id="${id}"` : '';
      return `<button type="button" class="btn ${variant}" ${attr}>${label}</button>`;
    })
    .join('');
  return `<div class="empty-state"><p>${message}</p><div class="empty-actions">${buttons}</div></div>`;
}

export function exportCSV(tableSel) {
  const rows = $$("tr", $(tableSel));
  const csv = rows
    .map((tr) => $$("th,td", tr)
      .map((td) => '"' + String(td.textContent).replaceAll('"', '""') + '"')
      .join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export { toast } from './toast.js';
