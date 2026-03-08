export function renderSidebar(items = []) {
  const nav = document.createElement('nav');
  nav.className = 'sidebar-menu';
  nav.innerHTML = `<ul>${items.map((item) => `<li><a data-route="${item.id}"><i class="fas ${item.icon}"></i><span>${item.label}</span></a></li>`).join('')}</ul>`;
  return nav;
}
