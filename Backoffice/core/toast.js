export function toast(message, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = `toast show toast-${type}`;
  setTimeout(() => el.classList.remove('show'), 2200);
}
