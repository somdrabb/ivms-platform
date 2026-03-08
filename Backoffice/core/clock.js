export function startClock(cellSelector = '#current-time') {
  const cell = document.querySelector(cellSelector);
  if (!cell) return;
  const update = () => {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    cell.textContent = `${now.toLocaleDateString(undefined, opts)} ${now.toLocaleTimeString()}`;
  };
  update();
  return setInterval(update, 1000);
}
