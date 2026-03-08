export function EmptyState(message, actions = []) {
  return `<div class="empty-state"><p>${message}</p><div class="empty-actions">${actions.map((action) => `<button class="btn ${action.variant || 'btn-primary'}" ${action.id ? `id="${action.id}"` : ''}>${action.label}</button>`).join('')}</div></div>`;
}
