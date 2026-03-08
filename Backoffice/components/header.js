export function renderHeader(title = 'Dashboard Overview') {
  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `
    <div class="header-left">
      <h1 id="page-title">${title}</h1>
      <p id="current-time">—</p>
    </div>
  `;
  return header;
}
